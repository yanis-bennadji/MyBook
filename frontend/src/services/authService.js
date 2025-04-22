import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const authService = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      const { user, token } = response.data;
      
      if (!token) {
        throw new Error('Token manquant dans la réponse du serveur');
      }

      // Créer l'objet utilisateur avec le token
      const userData = {
        ...user,
        token
      };

      // Stocker les données complètes dans le localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la connexion' };
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de l\'inscription' };
    }
  },

  logout: () => {
    localStorage.clear();
  },

  // Fonction pour récupérer l'utilisateur du localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }
};

export default authService; 