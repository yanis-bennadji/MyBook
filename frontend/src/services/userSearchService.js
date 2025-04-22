import api from './api';

export const searchUsers = async (query) => {
  try {
    const response = await api.get('/api/users/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche des utilisateurs:', error);
    throw error;
  }
};

export const getSuggestedUsers = async (limit = 5) => {
  try {
    const response = await api.get('/api/users/suggested', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs suggérés:', error);
    throw error;
  }
}; 