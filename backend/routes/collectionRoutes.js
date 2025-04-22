const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Récupérer les livres lus
router.get('/read', collectionController.getReadBooks);

// Ajouter un livre
router.post('/', collectionController.addBook);

// Supprimer un livre
router.delete('/:bookId', collectionController.removeBook);

module.exports = router; 