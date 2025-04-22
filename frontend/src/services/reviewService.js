import api from './api';

const reviewService = {
  // Créer une nouvelle review
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la création de la review' };
    }
  },

  // Récupérer les reviews d'un livre
  getBookReviews: async (bookId) => {
    try {
      const response = await api.get(`/reviews/book/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des reviews' };
    }
  },

  // Récupérer les reviews d'un utilisateur
  getUserReviews: async () => {
    try {
      const response = await api.get('/reviews/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des reviews' };
    }
  },

  // Modifier une review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la modification de la review' };
    }
  },

  // Supprimer une review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la suppression de la review' };
    }
  }
};

export default reviewService; 