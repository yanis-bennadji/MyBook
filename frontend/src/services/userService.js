import api from './api';
import favoriteBookService from './favoriteBookService';

/**
 * ! User Service
 * Handles all user-related operations, including:
 * - Profile management
 * - User search
 * - Integration with favorite books functionality
 */
const userService = {
  /**
   * * Update Profile
   * Updates a user's profile information including avatar
   * @param {FormData} formData - Form data including profile fields and optional avatar file
   * @returns {Promise<Object>} Updated user object
   */
  updateProfile: async (formData) => {
    try {
      const response = await api.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  },

  /**
   * * Get Profile
   * Retrieves the current user's profile information
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération du profil' };
    }
  },

  /**
   * * Get Profile By ID
   * Retrieves a specific user's profile by their ID
   * @param {number} userId - The ID of the user to retrieve
   * @returns {Promise<Object>} User profile data
   */
  getProfileById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération du profil' };
    }
  },

  /**
   * * Search Users
   * Searches for users based on a query string
   * @param {string} query - The search term
   * @returns {Promise<Array>} Array of matching user objects
   */
  searchUsers: async (query) => {
    try {
      const response = await api.get('/api/users/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la recherche des utilisateurs' };
    }
  },

  /**
   * * Get Suggested Users
   * Retrieves a list of suggested users (most active)
   * @param {number} limit - Maximum number of users to return
   * @returns {Promise<Array>} Array of suggested user objects
   */
  getSuggestedUsers: async (limit = 5) => {
    try {
      const response = await api.get('/api/users/suggested', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des suggestions' };
    }
  },

  /**
   * ? Favorite Books Integration
   * The following methods delegate to the favoriteBookService
   */

  /**
   * * Get Favorite Books
   * Retrieves a user's favorite books
   * @param {number|null} userId - Optional user ID (defaults to current user)
   * @returns {Promise<Array>} Array of favorite book objects with details
   */
  getFavoriteBooks: async (userId = null) => {
    return favoriteBookService.getFavoriteBooks(userId);
  },

  /**
   * * Add Favorite Book
   * Adds a book to the user's favorites
   * @param {string} bookId - The Google Books ID to add
   * @returns {Promise<Object>} The created favorite book entry
   */
  addFavoriteBook: async (bookId) => {
    return favoriteBookService.addFavoriteBook(bookId);
  },

  /**
   * * Update Favorite Books
   * Updates the ordering of favorite books
   * @param {Array} books - Array of book objects with position information
   * @returns {Promise<Array>} Updated array of favorite books
   */
  updateFavoriteBooks: async (books) => {
    return favoriteBookService.updateFavoriteBooks(books);
  }
};

export default userService; 