const prisma = require('../config/prisma');

// Récupérer les statistiques d'un utilisateur
const getUserStats = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || req.user.id;

    const [collections, reviews] = await Promise.all([
      prisma.collection.findMany({
        where: { userId }
      }),
      prisma.review.findMany({
        where: { userId }
      })
    ]);

    const stats = {
      booksRead: collections.length,
      reviewsWritten: reviews.length,
      averageRating: reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
        : 0,
      readingGoalProgress: Math.round((collections.length / 20) * 100), // Objectif fixé à 20 livres
      favoriteGenres: [], // À implémenter plus tard
      readingStreak: 0, // À implémenter plus tard
      totalPages: 0 // À implémenter plus tard
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

// Récupérer les reviews d'un utilisateur
const getUserReviews = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || req.user.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        collection: true
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Erreur lors de la récupération des reviews:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des reviews' });
  }
};

// Récupérer les collections d'un utilisateur
const getUserCollections = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || req.user.id;

    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { id: 'desc' }
    });

    res.json(collections);
  } catch (error) {
    console.error('Erreur lors de la récupération des collections:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des collections' });
  }
};

module.exports = {
  getUserStats,
  getUserReviews,
  getUserCollections
}; 