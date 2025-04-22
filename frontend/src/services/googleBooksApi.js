import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Cache simple pour les requêtes
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Dernière requête effectuée
let lastRequestTime = 0;
const THROTTLE_DELAY = 2000; // 2 secondes entre les requêtes

const throttleRequest = async (fn) => {
  const now = Date.now();
  const timeToWait = Math.max(0, THROTTLE_DELAY - (now - lastRequestTime));
  
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  lastRequestTime = Date.now();
  return fn();
};

export const searchBooks = async (query, options = {}) => {
  try {
    const cacheKey = `search-${query}-${JSON.stringify(options)}`;
    const cached = cache.get(cacheKey);
    
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

    const results = await throttleRequest(searchFn);
    
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return { results, error: null };
  } catch (error) {
    console.error('Erreur lors de la recherche de livres:', error);
    let errorMessage = 'Une erreur est survenue lors de la recherche.';
    
    if (error.response?.status === 429) {
      errorMessage = 'Limite de requêtes atteinte. Veuillez patienter quelques secondes et réessayer.';
      // Attendre un peu plus longtemps avant la prochaine requête
      lastRequestTime = Date.now() + 5000;
    }
    
    return { results: [], error: errorMessage };
  }
};

export const getBookDetails = async (bookId) => {
  try {
    const cacheKey = `details-${bookId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const detailsFn = async () => {
      const response = await axios.get(`${BASE_URL}/${bookId}`, {
        params: { key: API_KEY }
      });
      return response.data;
    };

    const data = await throttleRequest(detailsFn);
    
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

let suggestionTimeout = null;

export const getSearchSuggestions = async (query, options = {}) => {
  try {
    // Annuler la requête précédente si elle existe
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }

    // Attendre un peu avant d'envoyer la requête
    await new Promise(resolve => {
      suggestionTimeout = setTimeout(resolve, 300);
    });

    const cacheKey = `suggestions-${query}`;
    const cached = cache.get(cacheKey);
    
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

    const results = response.data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail
    }));

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