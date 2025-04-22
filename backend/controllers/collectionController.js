const prisma = require('../config/prisma');

// Récupérer tous les livres lus par l'utilisateur
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
      orderBy: {
        id: 'desc'
      }
    });

    res.json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres' });
  }
};

// Ajouter un livre à la collection
exports.addBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, status } = req.body;

    // Vérifier si le livre existe déjà dans la collection
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

// Supprimer un livre de la collection
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

    // Supprimer dans une transaction pour garantir l'intégrité des données
    await prisma.$transaction([
      // Supprimer la critique si elle existe
      prisma.review.deleteMany({
        where: {
          userId,
          bookId
        }
      }),
      // Supprimer le livre de la collection
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