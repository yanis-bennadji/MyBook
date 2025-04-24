import axios from 'axios';

/**
 * ! Google Books API Service
 * This service handles all interactions with the Google Books API,
 * including caching, throttling, and error handling.
 */

// API configuration
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * * Caching Implementation
 * Simple in-memory cache to avoid repeated API calls
 */
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * * Rate Limiting Implementation
 * Ensures we don't hit API limits by throttling requests
 */
let lastRequestTime = 0;
const THROTTLE_DELAY = 2000; // 2 seconds between requests

/**
 * ? Request Throttling Function
 * Ensures we wait an appropriate time between API calls
 * @param {Function} fn - The function to execute after throttling
 */
const throttleRequest = async (fn) => {
  const now = Date.now();
  const timeToWait = Math.max(0, THROTTLE_DELAY - (now - lastRequestTime));
  
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  lastRequestTime = Date.now();
  return fn();
};

/**
 * * Search Books Function
 * Searches for books based on a query string
 * @param {string} query - The search query
 * @param {Object} options - Search options (maxResults, orderBy, etc.)
 * @returns {Object} Object containing results array and any error
 */
export const searchBooks = async (query, options = {}) => {
  try {
    const cacheKey = `search-${query}-${JSON.stringify(options)}`;
    const cached = cache.get(cacheKey);
    
    // Return cached results if valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { results: cached.data, error: null };
    }

    const searchFn = async () => {
      const params = {
        q: query,
        key: API_KEY,
        maxResults: options.maxResults || 12,
        orderBy: options.orderBy || 'relevance',
        printType: options.printType || 'books',
        filter: options.filter || 'partial',
        langRestrict: 'fr'
      };

      const response = await axios.get(BASE_URL, { params });
      
      if (!response.data.items) {
        return [];
      }

      // Transform API response to our application model
      return response.data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || [],
        description: item.volumeInfo.description,
        thumbnail: item.volumeInfo.imageLinks?.thumbnail,
        averageRating: item.volumeInfo.averageRating,
        publisher: item.volumeInfo.publisher,
        publishedDate: item.volumeInfo.publishedDate,
        pageCount: item.volumeInfo.pageCount,
        language: item.volumeInfo.language,
        categories: item.volumeInfo.categories,
        previewLink: item.volumeInfo.previewLink
      }));
    };

    // Execute throttled search request
    const results = await throttleRequest(searchFn);
    
    // Cache the results
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return { results, error: null };
  } catch (error) {
    console.error('Erreur lors de la recherche de livres:', error);
    let errorMessage = 'Une erreur est survenue lors de la recherche.';
    
    // Handle rate limiting errors
    if (error.response?.status === 429) {
      errorMessage = 'Limite de requêtes atteinte. Veuillez patienter quelques secondes et réessayer.';
      // Wait longer before next request
      lastRequestTime = Date.now() + 5000;
    }
    
    return { results: [], error: errorMessage };
  }
};

/**
 * * Get Book Details Function
 * Fetches detailed information for a specific book by ID
 * @param {string} bookId - The Google Books volume ID
 * @returns {Object} The book details object
 */
export const getBookDetails = async (bookId) => {
  try {
    const cacheKey = `details-${bookId}`;
    const cached = cache.get(cacheKey);
    
    // Return cached results if valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const detailsFn = async () => {
      const response = await axios.get(`${BASE_URL}/${bookId}`, {
        params: { key: API_KEY }
      });
      return response.data;
    };

    // Execute throttled details request
    const data = await throttleRequest(detailsFn);
    
    // Cache the results
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du livre:', error);
    throw error;
  }
};

/**
 * * Search Suggestions Implementation
 * Provides typeahead search functionality with debouncing
 */
let suggestionTimeout = null;

/**
 * * Get Search Suggestions Function
 * Returns a limited set of book suggestions based on partial query
 * @param {string} query - The partial search query
 * @param {Object} options - Search options
 * @returns {Array} Array of suggestion objects
 */
export const getSearchSuggestions = async (query, options = {}) => {
  try {
    // Cancel previous request if it exists (debouncing)
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }

    // Wait before sending the request (prevents excessive API calls)
    await new Promise(resolve => {
      suggestionTimeout = setTimeout(resolve, 300);
    });

    const cacheKey = `suggestions-${query}`;
    const cached = cache.get(cacheKey);
    
    // Return cached results if valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const params = {
      q: query,
      key: API_KEY,
      maxResults: 5,
      orderBy: 'relevance',
      printType: 'books',
      filter: 'partial',
      langRestrict: 'fr'
    };

    const response = await axios.get(BASE_URL, { params });
    
    if (!response.data.items) {
      return [];
    }

    // Transform to simplified suggestion objects
    const results = response.data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail
    }));

    // Cache the results
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions:', error);
    return [];
  }
};