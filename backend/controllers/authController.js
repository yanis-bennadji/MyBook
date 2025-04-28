const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

/**
 * ! Authentication Controller
 * Handles user authentication operations, including:
 * - User registration with email verification
 * - User login with JWT token generation
 * - Email verification process
 */

/**
 * * Register User
 * Creates a new user account and sends verification email
 * @route POST /api/auth/register
 * @param {Object} req.body - User registration data
 * @param {string} req.body.username - User's display name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (passwordValidation !== true) {
      return res.status(400).json({ message: passwordValidation });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Inscription réussie. Veuillez vérifier votre email.',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

/**
 * ? Password Validation Helper
 * Verifies password meets security requirements
 * @param {string} password - Password to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validatePassword(password) {
  // Password validation (min 8 chars, 1 uppercase, 1 number, 1 symbol)
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (password.length < minLength) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  if (!hasUpperCase) {
    return 'Le mot de passe doit contenir au moins une majuscule';
  }
  if (!hasNumber) {
    return 'Le mot de passe doit contenir au moins un chiffre';
  }
  if (!hasSymbol) {
    return 'Le mot de passe doit contenir au moins un symbole';
  }
  
  return true;
}

/**
 * * Verify Email
 * Validates a user's email verification token
 * @route GET /api/auth/verify-email/:token
 * @param {string} req.params.token - Email verification token
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Tentative de vérification avec le token:', token);

    // Check if token is empty
    if (!token) {
      console.log('Token vide');
      return res.status(400).json({ message: 'Token de vérification manquant' });
    }

    /**
     * ? Token Validation
     * Find user with matching token or already verified
     */
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { verificationToken: token },
          { 
            AND: [
              { isVerified: true },
              { verificationToken: null }
            ]
          }
        ]
      }
    });

    if (!user) {
      console.log('Aucun utilisateur trouvé avec ce token');
      return res.status(400).json({ message: 'Token de vérification invalide' });
    }

    // If user is already verified
    if (user.isVerified) {
      console.log('Utilisateur déjà vérifié:', user.email);
      return res.json({ message: 'Email déjà vérifié' });
    }

    console.log('Utilisateur trouvé:', user.email);

    /**
     * ? Update Verification Status
     * Mark user as verified and clear token
     */
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    console.log('Email vérifié avec succès pour:', updatedUser.email);
    res.json({ message: 'Email vérifié avec succès' });
  } catch (error) {
    console.error('Erreur détaillée lors de la vérification:', error);
    console.error('Stack trace:', error.stack);
    console.error('Code d\'erreur:', error.code);
    console.error('Message d\'erreur:', error.message);
    res.status(500).json({ 
      message: 'Erreur lors de la vérification',
      error: error.message 
    });
  }
};

/**
 * * Login User
 * Authenticates a user and generates JWT token
 * @route POST /api/auth/login
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with all necessary data
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        isVerified: true,
        isAdmin: true,
        bio: true,
        avatar_url: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Veuillez vérifier votre email avant de vous connecter' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    /**
     * ? JWT Generation
     * Create authentication token with user ID
     */
    const token = jwt.sign(
      { 
        userId: user.id,
        isAdmin: user.isAdmin 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Return user and token
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

// Export validatePassword for testing
exports.validatePassword = validatePassword; 