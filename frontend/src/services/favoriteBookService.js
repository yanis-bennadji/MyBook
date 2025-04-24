import api from './api';
import { getBookDetails } from './googleBooksApi';

/**
 * ! Favorite Book Service
 * Manages user favorite books functionality, including:
 * - Adding and removing favorite books
 * - Retrieving favorite books with details
 * - Managing the position/ordering of favorite books
 */
const favoriteBookService = {
  /**
   * * Get Favorite Books
   * Retrieves a user's favorite books with Google Books details
   * @param {number|null} userId - Optional user ID (defaults to current user)
   * @returns {Promise<Array>} Array of favorite books with details
   */
  getFavoriteBooks: async (userId = null) => {
    try {
      const endpoint = userId ? `/api/favorite-books/users/${userId}` : '/api/favorite-books';
      console.log('Calling favorite books endpoint:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('Favorite books response:', response.data);
      
      const favorites = response.data;

      /**
       * ? Enrich with Google Books API
       * Add book details like title, authors and cover image
       */
      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const bookDetails = await getBookDetails(favorite.bookId);
            return {
              ...favorite,
              title: bookDetails.volumeInfo.title,
              authors: bookDetails.volumeInfo.authors,
              thumbnail: bookDetails.volumeInfo.imageLinks?.thumbnail
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails du livre ${favorite.bookId}:`, error);
            return {
              ...favorite,
              title: 'Livre non trouvé',
              authors: [],
              thumbnail: null
            };
          }
        })
      );

      console.log('Favorites with details:', favoritesWithDetails);
      return favoritesWithDetails;
    } catch (error) {
      console.error('Error in getFavoriteBooks:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des livres favoris' };
    }
  },

  /**
   * * Add Favorite Book
   * Adds a book to the user's favorites
   * @param {string} bookId - Google Books ID to add
   * @returns {Promise<Object>} The created favorite book entry
   */
  addFavoriteBook: async (bookId) => {
    try {
      const response = await api.post('/api/favorite-books', { bookId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout du livre aux favoris' };
    }
  },

  /**
   * * Update Position
   * Changes the position of a single favorite book
   * @param {string} bookId - Google Books ID
   * @param {number} newPosition - New position (1-4)
   * @returns {Promise<Object>} The updated favorite book entry
   */
  updatePosition: async (bookId, newPosition) => {
    try {
      const response = await api.put(`/api/favorite-books/${bookId}/position`, { newPosition });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la position' };
    }
  },

  /**
   * * Remove Favorite Book
   * Deletes a book from the user's favorites
   * @param {string} bookId - Google Books ID to remove
   * @returns {Promise<Object>} Confirmation message
   */
  removeFavoriteBook: async (bookId) => {
    try {
      const response = await api.delete(`/api/favorite-books/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du livre des favoris' };
    }
  },

  /**
   * * Update Favorite Books Order
   * Reorders multiple favorite books at once
   * @param {Array} books - Array of book objects with position information
   * @returns {Promise<Array>} Updated array of favorite books
   */
  updateFavoriteBooks: async (books) => {
    try {
      console.log('Updating favorite books order:', books);
      
      /**
       * ? Sequential Position Updates
       * Update each book's position one by one to maintain consistency
       */
      for (const book of books) {
        console.log(`Updating position for book ${book.bookId} to position ${book.position}`);
        try {
          await favoriteBookService.updatePosition(book.bookId, book.position);
        } catch (error) {
          console.error(`Error updating position for book ${book.bookId}:`, error);
          throw error;
        }
      }

      // Retrieve the updated list
      const updatedBooks = await favoriteBookService.getFavoriteBooks();
      console.log('Updated books list:', updatedBooks);
      return updatedBooks;
    } catch (error) {
      console.error('Error in updateFavoriteBooks:', error);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour des livres favoris' };
    }
  }
};

export default favoriteBookService; 