const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

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
 * @desc Authenticate a user and set cookie
 */
router.post('/login', authController.login);

/**
 * * User Logout
 * @route POST /api/auth/logout
 * @desc Clear authentication cookie
 */
router.post('/logout', authController.logout);

/**
 * * Get Current User
 * @route GET /api/auth/me
 * @desc Get current authenticated user data
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * * Email Verification
 * @route GET /api/auth/verify-email/:token
 * @desc Verify a user's email address using the verification token
 */
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router; 