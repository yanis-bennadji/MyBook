const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getFavoriteBooks,
  addFavoriteBook,
  updatePosition,
  removeFavoriteBook
} = require('../controllers/favoriteBookController');

// Protéger toutes les routes avec l'authentification
router.use(authenticateToken);

// Récupérer tous les livres favoris
router.get('/', getFavoriteBooks);

// Récupérer les livres favoris d'un utilisateur spécifique
router.get('/users/:userId', getFavoriteBooks);

// Ajouter un livre aux favoris
router.post('/', addFavoriteBook);

// Mettre à jour la position d'un livre favori
router.put('/:bookId/position', updatePosition);

// Supprimer un livre des favoris
router.delete('/:bookId', removeFavoriteBook);

module.exports = router; 