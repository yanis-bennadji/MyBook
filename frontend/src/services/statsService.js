import api from './api';
import { getBookDetails } from './googleBooksApi';

const statsService = {
  // Récupérer toutes les statistiques de l'utilisateur
  getUserStats: async (userId = null) => {
    try {
      const endpoint = userId ? `/stats/users/${userId}/stats` : '/stats/stats';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des statistiques' };
    }
  },

  // Récupérer l'activité récente de l'utilisateur
  getRecentActivity: async (userId = null) => {
    try {
      // Récupérer les critiques et les collections
      const [reviews, collections] = await Promise.all([
        api.get(userId ? `/stats/users/${userId}/reviews` : '/stats/reviews'),
        api.get(userId ? `/stats/users/${userId}/collections` : '/stats/collections')
      ]);

      // Créer un tableau pour stocker toutes les activités
      let activities = [];

      // Traiter les critiques
      for (const review of reviews.data) {
        try {
          // Récupérer les détails du livre depuis l'API Google Books
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

      // Traiter les livres lus
      for (const collection of collections.data) {
        // Vérifier si ce livre n'a pas déjà été ajouté via une critique
        if (!activities.some(activity => activity.bookId === collection.bookId)) {
          try {
            // Récupérer les détails du livre depuis l'API Google Books
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

      // Trier par date décroissante
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Retourner les 5 activités les plus récentes
      return activities.slice(0, 5);
    } catch (error) {
      throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération de l\'activité récente' };
    }
  }
};

export default statsService; 