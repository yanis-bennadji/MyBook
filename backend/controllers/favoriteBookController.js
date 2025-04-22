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

    // Vérifier si le livre favori existe
    const favorite = await prisma.favoriteBook.findFirst({
      where: { userId, bookId }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Livre favori non trouvé' });
    }

    // Mettre à jour la position
    const updatedFavorite = await prisma.favoriteBook.update({
      where: { id: favorite.id },
      data: { position: newPosition }
    });

    res.json(updatedFavorite);
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

    // Supprimer le favori
    await prisma.favoriteBook.delete({
      where: { id: favorite.id }
    });

    // Réorganiser les positions des favoris restants
    const remainingFavorites = await prisma.favoriteBook.findMany({
      where: { userId, position: { gt: favorite.position } }
    });

    for (const remaining of remainingFavorites) {
      await prisma.favoriteBook.update({
        where: { id: remaining.id },
        data: { position: remaining.position - 1 }
      });
    }

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