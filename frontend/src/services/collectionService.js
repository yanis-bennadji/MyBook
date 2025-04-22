import api from './api';
import { getBookDetails } from './googleBooksApi';

const collectionService = {
  // Récupérer tous les livres lus par l'utilisateur
  getUserBooks: async () => {
    try {
      const response = await api.get('/api/collections/read');
      const collections = response.data;
      
      // Récupérer les détails de chaque livre via l'API Google Books
      const booksWithDetails = await Promise.all(
        collections.map(async (collection) => {
          const bookDetails = await getBookDetails(collection.bookId);
          return {
            ...collection,
            bookDetails: bookDetails.volumeInfo
          };
        })
      );
      
      return booksWithDetails;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des livres' };
    }
  },

  // Ajouter un livre à la collection
  addBook: async (bookId) => {
    try {
      // Vérifier l'authentification
      const userStr = localStorage.getItem('user');
      console.log('User data in localStorage:', userStr);
      
      if (!userStr) {
        throw new Error('Utilisateur non connecté');
      }

      const user = JSON.parse(userStr);
      console.log('Token présent:', !!user.token);

      const response = await api.post('/api/collections', {
        bookId,
        status: 'read'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (error.response) {
        console.error('Réponse du serveur:', error.response.data);
      }
      throw error.response?.data || { message: 'Une erreur est survenue lors de l\'ajout du livre' };
    }
  },

  // Supprimer un livre de la collection
  removeBook: async (bookId) => {
    try {
      const response = await api.delete(`/api/collections/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la suppression du livre' };
    }
  }
};

export default collectionService; 