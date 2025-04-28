const prisma = require('../config/prisma');
const https = require('https');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            collections: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    console.log('Fetching all reviews...');
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        bookId: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Raw reviews from database:', JSON.stringify(reviews, null, 2));

    // Fetch book details from Google Books API
    const reviewsWithBooks = await Promise.all(
      reviews.map(async (review) => {
        const bookDetails = await new Promise((resolve, reject) => {
          https.get(`https://www.googleapis.com/books/v1/volumes/${review.bookId}`, (resp) => {
            let data = '';
            resp.on('data', (chunk) => { data += chunk; });
            resp.on('end', () => {
              try {
                const book = JSON.parse(data);
                resolve({
                  title: book.volumeInfo?.title || 'Titre inconnu',
                  author: book.volumeInfo?.authors?.[0] || 'Auteur inconnu',
                  coverImage: book.volumeInfo?.imageLinks?.thumbnail || null
                });
              } catch (error) {
                resolve({ title: 'Titre inconnu', author: 'Auteur inconnu', coverImage: null });
              }
            });
          }).on('error', () => {
            resolve({ title: 'Titre inconnu', author: 'Auteur inconnu', coverImage: null });
          });
        });

        const reviewWithBook = {
          ...review,
          book: bookDetails,
          comment: review.comment || 'Aucun commentaire' // Ensure comment is never null
        };
        console.log('Processed review:', JSON.stringify(reviewWithBook, null, 2));
        return reviewWithBook;
      })
    );

    console.log(`Successfully fetched ${reviews.length} reviews with book details`);
    res.json(reviewsWithBooks);
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'avis' });
  }
}; 