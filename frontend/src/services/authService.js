import axios from 'axios';

/**
 * ! Authentication Service
 * Handles user authentication operations, including:
 * - Login and registration
 * - Session management
 * - Cookie-based authentication only
 */
const API_URL = import.meta.env.VITE_AUTH_API_URL;

const authService = {
  /**
   * * Login
   * Authenticates a user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise<Object>} Authenticated user data
   */
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials, {
        withCredentials: true
      });
      
      if (!response.data.user) {
        throw new Error('Données utilisateur manquantes dans la réponse');
      }

      return response.data.user;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la connexion' };
    }
  },

  /**
   * * Register
   * Creates a new user account
   * @param {Object} userData - New user data (username, email, password)
   * @returns {Promise<Object>} Registration confirmation
   */
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de l\'inscription' };
    }
  },

  /**
   * * Logout
   * Terminates the user session by clearing the cookie
   */
  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },

  /**
   * * Get Current User
   * Fetches the current user data from the server
   * @returns {Promise<Object|null>} Current user data or null if not authenticated
   */
  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        withCredentials: true
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  }
};

export default authService; 