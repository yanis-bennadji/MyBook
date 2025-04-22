const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer tous les livres favoris d'un utilisateur
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

// Ajouter un livre aux favoris
const addFavoriteBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    // Vérifier si le livre est déjà dans les favoris
    const existingFavorite = await prisma.favoriteBook.findFirst({
      where: { userId, bookId }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Ce livre est déjà dans vos favoris' });
    }

    // Trouver la dernière position
    const lastFavorite = await prisma.favoriteBook.findFirst({
      where: { userId },
      orderBy: { position: 'desc' }
    });

    const newPosition = lastFavorite ? lastFavorite.position + 1 : 1;

    // Ajouter le nouveau favori
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

// Mettre à jour la position d'un livre favori
const updatePosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    const { newPosition } = req.body;

    // Utiliser une transaction pour garantir l'atomicité des opérations
    const result = await prisma.$transaction(async (tx) => {
      // Vérifier si le livre favori existe
      const favorite = await tx.favoriteBook.findFirst({
        where: { userId, bookId }
      });

      if (!favorite) {
        return { status: 404, data: { message: 'Livre favori non trouvé' } };
      }

      // Si la nouvelle position est la même que l'ancienne, ne rien faire
      if (favorite.position === newPosition) {
        return { status: 200, data: favorite };
      }

      // Vérifier que la nouvelle position est valide (entre 1 et 4)
      if (newPosition < 1 || newPosition > 4) {
        return { status: 400, data: { message: 'Position invalide' } };
      }

      // Récupérer tous les livres favoris de l'utilisateur
      const allFavorites = await tx.favoriteBook.findMany({
        where: { userId },
        orderBy: { position: 'asc' }
      });

      // Calculer les nouvelles positions
      const updatedFavorites = allFavorites.map(book => {
        if (book.id === favorite.id) {
          return { ...book, position: newPosition };
        }
        if (newPosition > favorite.position) {
          // Déplacement vers le bas
          if (book.position > favorite.position && book.position <= newPosition) {
            return { ...book, position: book.position - 1 };
          }
        } else {
          // Déplacement vers le haut
          if (book.position >= newPosition && book.position < favorite.position) {
            return { ...book, position: book.position + 1 };
          }
        }
        return book;
      });

      // Mettre à jour toutes les positions en une seule transaction
      for (const book of updatedFavorites) {
        await tx.favoriteBook.update({
          where: { id: book.id },
          data: { position: -book.position } // Utiliser des positions temporaires négatives
        });
      }

      // Mettre à jour avec les positions finales
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

// Supprimer un livre des favoris
const removeFavoriteBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    // Vérifier si le livre favori existe
    const favorite = await prisma.favoriteBook.findFirst({
      where: { userId, bookId }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Livre favori non trouvé' });
    }

    // Utiliser une transaction pour garantir l'atomicité des opérations
    await prisma.$transaction(async (tx) => {
      // Supprimer le favori
      await tx.favoriteBook.delete({
        where: { id: favorite.id }
      });

      // Récupérer et mettre à jour les positions des favoris restants en une seule opération
      const remainingFavorites = await tx.favoriteBook.findMany({
        where: {
          userId,
          position: { gt: favorite.position }
        },
        orderBy: { position: 'asc' }
      });

      // Mettre à jour les positions en une seule opération
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