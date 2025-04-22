const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer un token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken,
      },
    });

    // Envoyer l'email de vérification
    await emailService.sendVerificationEmail(email, verificationToken);

    // Ne pas renvoyer le mot de passe
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

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Tentative de vérification avec le token:', token);

    // Vérifier que le token n'est pas vide
    if (!token) {
      console.log('Token vide');
      return res.status(400).json({ message: 'Token de vérification manquant' });
    }

    // Vérifier si le token existe dans la base de données
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

    // Si l'utilisateur est déjà vérifié
    if (user.isVerified) {
      console.log('Utilisateur déjà vérifié:', user.email);
      return res.json({ message: 'Email déjà vérifié' });
    }

    console.log('Utilisateur trouvé:', user.email);

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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe avec toutes ses données
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        isVerified: true,
        bio: true,
        avatar_url: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Veuillez vérifier votre email avant de vous connecter' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // Renvoyer l'utilisateur et le token
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
}; 