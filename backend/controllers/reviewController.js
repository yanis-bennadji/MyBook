const prisma = require('../config/prisma');

/**
 * ! Review Controller
 * Manages book reviews functionality, including:
 * - Creating and updating reviews
 * - Retrieving reviews by book or user
 * - Handling review permissions
 * - Deleting reviews
 */

/**
 * * Create Review
 * Adds a new review for a book
 * @route POST /api/reviews
 * @param {Object} req.body - Review data
 * @param {string} req.body.bookId - Google Books ID
 * @param {number} req.body.rating - Rating value (1-5)
 * @param {string} req.body.comment - Optional review text
 * @param {Date} req.body.finishDate - Optional date when book was finished
 */
exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, comment, finishDate } = req.body;
    const userId = req.user.id; // Retrieved from auth middleware

    /**
     * ? Duplicate Check
     * Verify user hasn't already reviewed this book
     */
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        bookId
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Vous avez déjà publié une critique pour ce livre' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        bookId,
        rating,
        comment,
        finishDate: finishDate ? new Date(finishDate) : null
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true
          }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Erreur lors de la création de la review:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la review' });
  }
};

/**
 * * Get Book Reviews
 * Retrieves all reviews for a specific book
 * @route GET /api/reviews/book/:bookId
 * @param {string} req.params.bookId - Google Books ID
 */
exports.getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: {
        bookId
      },
      select: {
        id: true,
        bookId: true,
        rating: true,
        comment: true,
        finishDate: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        finishDate: 'desc'
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Erreur lors de la récupération des reviews:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des reviews' });
  }
};

/**
 * * Get User Reviews
 * Retrieves all reviews written by the authenticated user
 * @route GET /api/reviews/user
 */
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await prisma.review.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        bookId: true,
        rating: true,
        comment: true,
        finishDate: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        finishDate: 'desc'
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Erreur lors de la récupération des reviews:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des reviews' });
  }
};

/**
 * * Update Review
 * Modifies an existing review
 * @route PUT /api/reviews/:id
 * @param {number} req.params.id - Review ID to update
 * @param {Object} req.body - Updated review data
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, finishDate } = req.body;
    const userId = req.user.id;

    /**
     * ? Permission Check
     * Verify the review belongs to the authenticated user
     */
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review non trouvée' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette review' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        rating,
        comment,
        finishDate: finishDate ? new Date(finishDate) : null
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true
          }
        }
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Erreur lors de la modification de la review:', error);
    res.status(500).json({ message: 'Erreur lors de la modification de la review' });
  }
};

/**
 * * Delete Review
 * Removes a review from the database
 * @route DELETE /api/reviews/:id
 * @param {number} req.params.id - Review ID to delete
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    /**
     * ? Permission Check
     * Verify the review belongs to the authenticated user
     */
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review non trouvée' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette review' });
    }

    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Review supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la review:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la review' });
  }
}; 