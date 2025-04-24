import api from './api';
import { getBookDetails } from './googleBooksApi';

/**
 * ! Stats Service
 * Handles fetching and processing user statistics and activity data.
 * Integrates with Google Books API to enrich data with book details.
 */
const statsService = {
  /**
   * * Get User Stats
   * Retrieves aggregated statistics about a user's reading activity
   * @param {number|null} userId - Optional user ID (defaults to current user)
   * @returns {Promise<Object>} Statistics object with reading metrics
   */
  getUserStats: async (userId = null) => {
    try {
      const endpoint = userId ? `/api/stats/users/${userId}/stats` : '/api/stats/stats';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des statistiques' };
    }
  },

  /**
   * * Get Recent Activity
   * Retrieves and processes a user's recent reading activities
   * @param {number|null} userId - Optional user ID (defaults to current user)
   * @returns {Promise<Array>} Array of recent activity items with book details
   */
  getRecentActivity: async (userId = null) => {
    try {
      /**
       * ? Parallel API Requests
       * Fetch both reviews and collections simultaneously
       */
      const [reviews, collections] = await Promise.all([
        api.get(userId ? `/api/stats/users/${userId}/reviews` : '/api/stats/reviews'),
        api.get(userId ? `/api/stats/users/${userId}/collections` : '/api/stats/collections')
      ]);

      // Create array for all activities
      let activities = [];

      /**
       * * Process Reviews
       * Transform review data and enrich with book details
       */
      for (const review of reviews.data) {
        try {
          // Get book details from Google Books API
          const bookDetails = await getBookDetails(review.bookId);

          activities.push({
            id: `review-${review.id}`,
            type: 'review',
            bookId: review.bookId,
            bookTitle: bookDetails.volumeInfo.title,
            bookImage: bookDetails.volumeInfo.imageLinks?.thumbnail,
            date: review.finishDate || review.createdAt,
            rating: review.rating
          });
        } catch (error) {
          console.error(`Erreur lors de la récupération des détails du livre ${review.bookId}:`, error);
        }
      }

      /**
       * * Process Collections (Read Books)
       * Transform collection data and enrich with book details
       * Avoid duplicates with books already processed from reviews
       */
      for (const collection of collections.data) {
        // Check if this book hasn't already been added via a review
        if (!activities.some(activity => activity.bookId === collection.bookId)) {
          try {
            // Get book details from Google Books API
            const bookDetails = await getBookDetails(collection.bookId);

            activities.push({
              id: `book-${collection.id}`,
              type: 'read',
              bookId: collection.bookId,
              bookTitle: bookDetails.volumeInfo.title,
              bookImage: bookDetails.volumeInfo.imageLinks?.thumbnail,
              date: collection.finishDate || collection.createdAt
            });
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails du livre ${collection.bookId}:`, error);
          }
        }
      }

      /**
       * ? Sort and Limit Results
       * Sort by date (newest first) and return only the 5 most recent
       */
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      return activities.slice(0, 5);
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération de l\'activité récente' };
    }
  }
};

export default statsService; 