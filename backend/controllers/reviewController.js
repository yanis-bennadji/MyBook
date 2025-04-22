const prisma = require('../config/prisma');

exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, comment, finishDate } = req.body;
    const userId = req.user.id; // Récupéré depuis le middleware d'authentification

    // Vérifier si l'utilisateur a déjà fait une review pour ce livre
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

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, finishDate } = req.body;
    const userId = req.user.id;

    // Vérifier si la review appartient à l'utilisateur
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

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier si la review appartient à l'utilisateur
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