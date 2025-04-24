const prisma = require('../config/prisma');

/**
 * ! Stats Controller
 * Provides statistical information and activity data, including:
 * - User reading statistics
 * - Review history
 * - Collection/reading history
 */

/**
 * * Get User Stats
 * Retrieves aggregated statistics about a user's reading activity
 * @route GET /api/stats/stats (current user)
 * @route GET /api/stats/users/:userId/stats (specific user)
 * @param {number} req.params.userId - Optional user ID (defaults to authenticated user)
 */
const getUserStats = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || req.user.id;

    /**
     * ? Parallel Data Fetching
     * Retrieve collections and reviews simultaneously for efficiency
     */
    const [collections, reviews] = await Promise.all([
      prisma.collection.findMany({
        where: { userId }
      }),
      prisma.review.findMany({
        where: { userId }
      })
    ]);

    /**
     * * Stats Calculation
     * Compute various reading metrics from the raw data
     */
    const stats = {
      booksRead: collections.length,
      reviewsWritten: reviews.length,
      averageRating: reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
        : 0,
      readingGoalProgress: Math.round((collections.length / 20) * 100), // Goal set to 20 books
      favoriteGenres: [], // To be implemented later
      readingStreak: 0, // To be implemented later
      totalPages: 0 // To be implemented later
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

/**
 * * Get User Reviews
 * Retrieves a user's review history
 * @route GET /api/stats/reviews (current user)
 * @route GET /api/stats/users/:userId/reviews (specific user)
 * @param {number} req.params.userId - Optional user ID (defaults to authenticated user)
 */
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

/**
 * * Get User Collections
 * Retrieves a user's book collection history
 * @route GET /api/stats/collections (current user)
 * @route GET /api/stats/users/:userId/collections (specific user)
 * @param {number} req.params.userId - Optional user ID (defaults to authenticated user)
 */
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