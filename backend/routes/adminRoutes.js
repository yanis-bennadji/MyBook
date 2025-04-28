const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all routes with admin middleware
router.use(adminMiddleware);

// User routes
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Review routes
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router; 