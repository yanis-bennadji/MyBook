import api from './api';

export const adminService = {
  // Users
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Reviews
  getAllReviews: async () => {
    const response = await api.get('/api/admin/reviews');
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/api/admin/reviews/${reviewId}`);
    return response.data;
  }
}; 