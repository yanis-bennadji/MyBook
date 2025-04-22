const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Routes protégées (nécessitent une authentification)
router.get('/profile', auth, userController.getCurrentProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/search', auth, userController.searchUsers);
router.get('/suggested', auth, userController.getSuggestedUsers);

// Route publique pour voir un profil
router.get('/:id', auth, userController.getUserById);

module.exports = router; 