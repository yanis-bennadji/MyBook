const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with admin status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = adminMiddleware; 