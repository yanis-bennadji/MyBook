import api from './api';
import { getBookDetails } from './googleBooksApi';

/**
 * ! Collection Service
 * Manages a user's book collection, including:
 * - Adding and removing books from collection
 * - Retrieving books with Google Books API details
 * - Supporting "read" status tracking
 */
const collectionService = {
  /**
   * * Get User Books
   * Retrieves all books in the user's collection
   * @returns {Promise<Array>} Array of books with Google Books details
   */
  getUserBooks: async () => {
    try {
      const response = await api.get('/api/collections/read');
      const collections = response.data;
      
      /**
       * ? Enrich with Google Books API
       * Add complete book details from Google Books API to each collection item
       */
      const booksWithDetails = await Promise.all(
        collections.map(async (collection) => {
          const bookDetails = await getBookDetails(collection.bookId);
          return {
            ...collection,
            bookDetails: bookDetails.volumeInfo
          };
        })
      );
      
      return booksWithDetails;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des livres' };
    }
  },

  /**
   * * Add Book
   * Adds a book to the user's collection with "read" status
   * @param {string} bookId - Google Books ID to add
   * @returns {Promise<Object>} The created collection entry
   */
  addBook: async (bookId) => {
    try {
      /**
       * ? Authentication Check
       * Verify user is logged in before making request
       */
      const userStr = localStorage.getItem('user');
      console.log('User data in localStorage:', userStr);
      
      if (!userStr) {
        throw new Error('Utilisateur non connecté');
      }

      const user = JSON.parse(userStr);
      console.log('Token présent:', !!user.token);

      const response = await api.post('/api/collections', {
        bookId,
        status: 'read'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (error.response) {
        console.error('Réponse du serveur:', error.response.data);
      }
      throw error.response?.data || { message: 'Une erreur est survenue lors de l\'ajout du livre' };
    }
  },

  /**
   * * Remove Book
   * Deletes a book from the user's collection
   * @param {string} bookId - Google Books ID to remove
   * @returns {Promise<Object>} Confirmation message
   */
  removeBook: async (bookId) => {
    try {
      const response = await api.delete(`/api/collections/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la suppression du livre' };
    }
  }
};

export default collectionService; 