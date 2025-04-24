const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * ! Favorite Book Controller
 * Manages user favorite books functionality, including:
 * - Retrieving user's favorite books
 * - Adding books to favorites
 * - Updating favorite book positions
 * - Removing books from favorites
 */

/**
 * * Get Favorite Books
 * Retrieves all favorite books for a specific user
 * @route GET /api/favorite-books
 * @route GET /api/favorite-books/users/:userId
 * @param {number} req.params.userId - Optional user ID (defaults to authenticated user)
 */
const getFavoriteBooks = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || req.user.id;
    console.log('Fetching favorite books for userId:', userId);
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);

    const favorites = await prisma.favoriteBook.findMany({
      where: { userId },
      orderBy: { position: 'asc' }
    });

    console.log('Found favorites:', favorites);
    res.json(favorites);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres favoris:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres favoris' });
  }
};

/**
 * * Add Favorite Book
 * Adds a book to the user's favorites
 * @route POST /api/favorite-books
 * @param {Object} req.body - Book information
 * @param {string} req.body.bookId - Google Books ID
 */
const addFavoriteBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    /**
     * ? Duplicate Check
     * Verify book isn't already in favorites
     */
    const existingFavorite = await prisma.favoriteBook.findFirst({
      where: { userId, bookId }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Ce livre est déjà dans vos favoris' });
    }

    /**
     * ? Position Assignment
     * Find the last position and increment by 1
     */
    const lastFavorite = await prisma.favoriteBook.findFirst({
      where: { userId },
      orderBy: { position: 'desc' }
    });

    const newPosition = lastFavorite ? lastFavorite.position + 1 : 1;

    // Add the new favorite
    const favorite = await prisma.favoriteBook.create({
      data: {
        userId,
        bookId,
        position: newPosition
      }
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre aux favoris:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du livre aux favoris' });
  }
};

/**
 * * Update Position
 * Changes the position of a favorite book
 * @route PUT /api/favorite-books/:bookId/position
 * @param {string} req.params.bookId - Google Books ID
 * @param {Object} req.body - Position data
 * @param {number} req.body.newPosition - New position (1-4)
 */
const updatePosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    const { newPosition } = req.body;

    /**
     * ! Transaction
     * Use transaction to ensure atomicity of position updates
     */
    const result = await prisma.$transaction(async (tx) => {
      // Check if favorite book exists
      const favorite = await tx.favoriteBook.findFirst({
        where: { userId, bookId }
      });

      if (!favorite) {
        return { status: 404, data: { message: 'Livre favori non trouvé' } };
      }

      // If position hasn't changed, do nothing
      if (favorite.position === newPosition) {
        return { status: 200, data: favorite };
      }

      /**
       * ? Validate Position
       * Ensure position is within valid range
       */
      if (newPosition < 1 || newPosition > 4) {
        return { status: 400, data: { message: 'Position invalide' } };
      }

      // Get all favorites for position recalculation
      const allFavorites = await tx.favoriteBook.findMany({
        where: { userId },
        orderBy: { position: 'asc' }
      });

      /**
       * ? Position Calculation
       * Calculate new positions for all affected books
       */
      const updatedFavorites = allFavorites.map(book => {
        if (book.id === favorite.id) {
          return { ...book, position: newPosition };
        }
        if (newPosition > favorite.position) {
          // Moving down - shift affected books up
          if (book.position > favorite.position && book.position <= newPosition) {
            return { ...book, position: book.position - 1 };
          }
        } else {
          // Moving up - shift affected books down
          if (book.position >= newPosition && book.position < favorite.position) {
            return { ...book, position: book.position + 1 };
          }
        }
        return book;
      });

      /**
       * ! Two-Phase Position Update
       * First set temporary negative positions to avoid constraints,
       * then set final positions
       */
      // Phase 1: Set temporary negative positions
      for (const book of updatedFavorites) {
        await tx.favoriteBook.update({
          where: { id: book.id },
          data: { position: -book.position } // Use negative values temporarily
        });
      }

      // Phase 2: Set final positions
      for (const book of updatedFavorites) {
        await tx.favoriteBook.update({
          where: { id: book.id },
          data: { position: Math.abs(book.position) }
        });
      }

      return { status: 200, data: favorite };
    });

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la position:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la position' });
  }
};

/**
 * * Remove Favorite Book
 * Deletes a book from the user's favorites
 * @route DELETE /api/favorite-books/:bookId
 * @param {string} req.params.bookId - Google Books ID to remove
 */
const removeFavoriteBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    // Check if favorite book exists
    const favorite = await prisma.favoriteBook.findFirst({
      where: { userId, bookId }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Livre favori non trouvé' });
    }

    /**
     * ! Transaction
     * Use transaction to ensure atomicity when reordering positions
     */
    await prisma.$transaction(async (tx) => {
      // Delete the favorite
      await tx.favoriteBook.delete({
        where: { id: favorite.id }
      });

      /**
       * ? Position Reordering
       * Update positions of remaining favorites to maintain sequence
       */
      const remainingFavorites = await tx.favoriteBook.findMany({
        where: {
          userId,
          position: { gt: favorite.position }
        },
        orderBy: { position: 'asc' }
      });

      // Update positions in a single operation
      await Promise.all(
        remainingFavorites.map((book, index) =>
          tx.favoriteBook.update({
            where: { id: book.id },
            data: { position: favorite.position + index }
          })
        )
      );
    });

    res.json({ message: 'Livre retiré des favoris avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre des favoris:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du livre des favoris' });
  }
};

module.exports = {
  getFavoriteBooks,
  addFavoriteBook,
  updatePosition,
  removeFavoriteBook
}; 