import api from './api';
import favoriteBookService from './favoriteBookService';

const userService = {
  // Mettre à jour le profil utilisateur
  updateProfile: async (formData) => {
    try {
      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  },

  // Récupérer les informations du profil
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération du profil' };
    }
  },

  // Récupérer les informations d'un profil utilisateur par ID
  getProfileById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération du profil' };
    }
  },

  // Rechercher des utilisateurs
  searchUsers: async (query) => {
    try {
      const response = await api.get('/users/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la recherche des utilisateurs' };
    }
  },

  // Récupérer les utilisateurs suggérés (les plus actifs)
  getSuggestedUsers: async (limit = 5) => {
    try {
      const response = await api.get('/users/suggested', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des suggestions' };
    }
  },

  // Récupérer les livres favoris
  getFavoriteBooks: async (userId = null) => {
    return favoriteBookService.getFavoriteBooks(userId);
  },

  // Ajouter un livre aux favoris
  addFavoriteBook: async (bookId) => {
    return favoriteBookService.addFavoriteBook(bookId);
  },

  // Mettre à jour les livres favoris
  updateFavoriteBooks: async (books) => {
    return favoriteBookService.updateFavoriteBooks(books);
  }
};

export default userService; 