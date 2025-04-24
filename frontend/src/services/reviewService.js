import api from './api';

/**
 * ! Review Service
 * Manages all operations related to book reviews, including:
 * - Creating and updating reviews
 * - Fetching reviews by book or user
 * - Deleting reviews
 */
const reviewService = {
  /**
   * * Create Review
   * Creates a new review for a book
   * @param {Object} reviewData - Review data including bookId, rating, and optional comment
   * @returns {Promise<Object>} The created review
   */
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/api/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la création de la review' };
    }
  },

  /**
   * * Get Book Reviews
   * Retrieves all reviews for a specific book
   * @param {string} bookId - Google Books ID
   * @returns {Promise<Array>} Array of review objects
   */
  getBookReviews: async (bookId) => {
    try {
      const response = await api.get(`/api/reviews/book/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des reviews' };
    }
  },

  /**
   * * Get User Reviews
   * Retrieves all reviews written by the current user
   * @returns {Promise<Array>} Array of review objects
   */
  getUserReviews: async () => {
    try {
      const response = await api.get('/api/reviews/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des reviews' };
    }
  },

  /**
   * * Update Review
   * Modifies an existing review
   * @param {number} reviewId - ID of the review to update
   * @param {Object} reviewData - Updated review data
   * @returns {Promise<Object>} The updated review
   */
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la modification de la review' };
    }
  },

  /**
   * * Delete Review
   * Removes a review from the database
   * @param {number} reviewId - ID of the review to delete
   * @returns {Promise<Object>} Confirmation message
   */
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la suppression de la review' };
    }
  }
};

export default reviewService; 