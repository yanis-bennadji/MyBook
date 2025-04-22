import api from './api';
import { getBookDetails } from './googleBooksApi';

const favoriteBookService = {
  // Récupérer tous les livres favoris
  getFavoriteBooks: async (userId = null) => {
    try {
      const endpoint = userId ? `/api/favorite-books/users/${userId}` : '/api/favorite-books';
      console.log('Calling favorite books endpoint:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('Favorite books response:', response.data);
      
      const favorites = response.data;

      // Récupérer les détails des livres depuis l'API Google Books
      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const bookDetails = await getBookDetails(favorite.bookId);
            return {
              ...favorite,
              title: bookDetails.volumeInfo.title,
              authors: bookDetails.volumeInfo.authors,
              thumbnail: bookDetails.volumeInfo.imageLinks?.thumbnail
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails du livre ${favorite.bookId}:`, error);
            return {
              ...favorite,
              title: 'Livre non trouvé',
              authors: [],
              thumbnail: null
            };
          }
        })
      );

      console.log('Favorites with details:', favoritesWithDetails);
      return favoritesWithDetails;
    } catch (error) {
      console.error('Error in getFavoriteBooks:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des livres favoris' };
    }
  },

  // Ajouter un livre aux favoris
  addFavoriteBook: async (bookId) => {
    try {
      const response = await api.post('/api/favorite-books', { bookId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout du livre aux favoris' };
    }
  },

  // Mettre à jour la position d'un livre favori
  updatePosition: async (bookId, newPosition) => {
    try {
      const response = await api.put(`/api/favorite-books/${bookId}/position`, { newPosition });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la position' };
    }
  },

  // Supprimer un livre des favoris
  removeFavoriteBook: async (bookId) => {
    try {
      const response = await api.delete(`/api/favorite-books/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du livre des favoris' };
    }
  },

  // Mettre à jour l'ordre complet des livres favoris
  updateFavoriteBooks: async (books) => {
    try {
      console.log('Updating favorite books order:', books);
      
      // Mettre à jour les positions une par une
      for (const book of books) {
        console.log(`Updating position for book ${book.bookId} to position ${book.position}`);
        try {
          await favoriteBookService.updatePosition(book.bookId, book.position);
        } catch (error) {
          console.error(`Error updating position for book ${book.bookId}:`, error);
          throw error;
        }
      }

      // Récupérer la liste mise à jour
      const updatedBooks = await favoriteBookService.getFavoriteBooks();
      console.log('Updated books list:', updatedBooks);
      return updatedBooks;
    } catch (error) {
      console.error('Error in updateFavoriteBooks:', error);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour des livres favoris' };
    }
  }
};

export default favoriteBookService; 