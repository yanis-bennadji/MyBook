const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Routes publiques (pas besoin d'authentification)
router.get('/book/:bookId', reviewController.getBookReviews);

// Routes protégées (nécessitent une authentification)
router.use(auth);

// Créer une nouvelle review
router.post('/', reviewController.createReview);

// Récupérer les reviews de l'utilisateur connecté
router.get('/user', reviewController.getUserReviews);

// Modifier une review
router.put('/:id', reviewController.updateReview);

// Supprimer une review
router.delete('/:id', reviewController.deleteReview);

module.exports = router; 