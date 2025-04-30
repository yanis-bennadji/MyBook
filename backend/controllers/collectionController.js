const prisma = require('../config/prisma');

/**
 * ! Collection Controller
 * Manages user book collections with the following functionality:
 * - Retrieving user's read books
 * - Adding books to collection
 * - Removing books from collection
 */

/**
 * * Get Read Books
 * Retrieves all books marked as read by the user
 * @route GET /api/collections/read
 */
exports.getReadBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const books = await prisma.collection.findMany({
      where: {
        userId,
        status: 'read'
      },
      include: {
        review: true
      },
      orderBy: [
        {
          finishDate: 'desc'
        }
      ]
    });

    res.json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres' });
  }
};

/**
 * * Add Book
 * Adds a book to the user's collection
 * @route POST /api/collections
 * @param {Object} req.body - Book information
 * @param {string} req.body.bookId - Google Books ID
 * @param {string} req.body.status - Book status (e.g., 'read')
 */
exports.addBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, status } = req.body;

    /**
     * ? Duplicate Check
     * Verify the book isn't already in the collection
     */
    const existingBook = await prisma.collection.findFirst({
      where: {
        userId,
        bookId,
        status
      }
    });

    if (existingBook) {
      return res.status(400).json({ message: 'Ce livre est déjà dans votre collection' });
    }

    const book = await prisma.collection.create({
      data: {
        userId,
        bookId,
        status
      }
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du livre' });
  }
};

/**
 * * Remove Book
 * Deletes a book from the user's collection
 * @route DELETE /api/collections/:bookId
 * @param {string} req.params.bookId - Google Books ID to remove
 */
exports.removeBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const book = await prisma.collection.findFirst({
      where: {
        userId,
        bookId
      }
    });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé dans votre collection' });
    }

    /**
     * ! Transaction
     * Use a transaction to ensure data integrity when deleting related records
     */
    await prisma.$transaction([
      // Delete associated review if exists
      prisma.review.deleteMany({
        where: {
          userId,
          bookId
        }
      }),
      // Delete book from collection
      prisma.collection.delete({
        where: {
          id: book.id
        }
      })
    ]);

    res.json({ message: 'Livre et critique associée supprimés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du livre' });
  }
}; 