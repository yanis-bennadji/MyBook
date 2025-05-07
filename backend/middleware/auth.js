const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupérer le token du cookie
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Vérifier le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = { 
      id: decodedToken.userId,
      isAdmin: decodedToken.isAdmin 
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter' });
    }
    res.status(401).json({ message: 'Token invalide' });
  }
}; 