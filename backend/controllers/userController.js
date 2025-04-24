const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * ! User Controller
 * Handles all user-related operations including:
 * - Profile management
 * - User search
 * - Avatar upload and management
 */

/**
 * * Multer Configuration
 * Sets up file storage for user avatar uploads
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.'));
    }
  }
}).single('avatar');

/**
 * * Create User
 * Creates a new user account with encrypted password
 * @route POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
    } else {
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    }
  }
};

/**
 * * Update Profile
 * Updates user profile information including avatar
 * @route PUT /api/users/profile
 * ? Handles file upload with multer middleware
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        const updateData = {
          username: req.body.username,
          bio: req.body.bio
        };

        // Handle avatar upload if file is provided
        if (req.file) {
          const avatarUrl = `/uploads/avatars/${req.file.filename}`;
          updateData.avatar_url = avatarUrl;

          // Delete previous avatar if exists
          const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatar_url: true }
          });

          if (currentUser?.avatar_url) {
            const oldAvatarPath = path.join(__dirname, '..', currentUser.avatar_url);
            try {
              await fs.unlink(oldAvatarPath);
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'ancien avatar:', error);
            }
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatar_url: true
          }
        });

        res.json(updatedUser);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

/**
 * * Get Current Profile
 * Retrieves the logged-in user's profile
 * @route GET /api/users/profile
 */
const getCurrentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

/**
 * * Get User By ID
 * Retrieves a specific user's public profile
 * @route GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar_url: true,
        createdAt: true,
        _count: {
          select: {
            collections: true,
            favoriteBooks: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

/**
 * * Search Users
 * Searches for users by username
 * @route GET /api/users/search
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Le terme de recherche est requis' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: q
            }
          },
          {
            email: {
              contains: q
            }
          }
        ],
        NOT: {
          id: req.user.id
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        bio: true,
        _count: {
          select: {
            collections: true,
            favoriteBooks: true
          }
        }
      },
      take: 10,
      orderBy: {
        username: 'asc'
      }
    });

    // Transformer la réponse pour correspondre à l'interface attendue
    const transformedUsers = users.map(user => ({
      ...user,
      _count: {
        ...user._count,
        readBooks: user._count.collections
      }
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Erreur lors de la recherche des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche des utilisateurs' });
  }
};

// Récupérer les utilisateurs suggérés
const getSuggestedUsers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const suggestedUsers = await prisma.user.findMany({
      where: {
        NOT: {
          id: req.user.id
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        bio: true,
        _count: {
          select: {
            collections: true,
            favoriteBooks: true
          }
        }
      },
      orderBy: {
        collections: {
          _count: 'desc'
        }
      },
      take: parseInt(limit)
    });

    res.json(suggestedUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs suggérés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs suggérés' });
  }
};

module.exports = {
  createUser,
  updateProfile,
  getCurrentProfile,
  getUserById,
  searchUsers,
  getSuggestedUsers
}; 