const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Vérifier le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = { id: decodedToken.userId };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
}; 