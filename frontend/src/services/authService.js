import axios from 'axios';

/**
 * ! Authentication Service
 * Handles user authentication operations, including:
 * - Login and registration
 * - Session management
 * - Token storage and retrieval
 */
const API_URL = import.meta.env.VITE_AUTH_API_URL;

const authService = {
  /**
   * * Login
   * Authenticates a user and stores session data
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise<Object>} Authenticated user data with token
   */
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      const { user, token } = response.data;
      
      if (!token) {
        throw new Error('Token manquant dans la réponse du serveur');
      }

      /**
       * ? Session Creation
       * Create user object with token and store in localStorage
       */
      const userData = {
        ...user,
        token
      };

      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
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
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de l\'inscription' };
    }
  },

  /**
   * * Logout
   * Terminates the user session
   * Clears all localStorage data
   */
  logout: () => {
    localStorage.clear();
  },

  /**
   * * Get Current User
   * Retrieves the currently authenticated user from localStorage
   * @returns {Object|null} Current user data or null if not authenticated
   */
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