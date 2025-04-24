const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * ! Authentication Routes
 * Handles all authentication-related endpoints
 */

/**
 * * User Registration
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', authController.register);

/**
 * * User Login
 * @route POST /api/auth/login
 * @desc Authenticate a user and return token
 */
router.post('/login', authController.login);

/**
 * * Email Verification
 * @route GET /api/auth/verify-email/:token
 * @desc Verify a user's email address using the verification token
 */
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router; 