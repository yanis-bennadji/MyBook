const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

// Routes pour les statistiques personnelles
router.get('/stats', auth, statsController.getUserStats);
router.get('/reviews', auth, statsController.getUserReviews);
router.get('/collections', auth, statsController.getUserCollections);

// Routes pour les statistiques d'un utilisateur spécifique
router.get('/users/:userId/stats', auth, statsController.getUserStats);
router.get('/users/:userId/reviews', auth, statsController.getUserReviews);
router.get('/users/:userId/collections', auth, statsController.getUserCollections);

module.exports = router; 