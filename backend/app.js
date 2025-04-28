const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collectionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteBookRoutes = require('./routes/favoriteBookRoutes');
const statsRoutes = require('./routes/statsRoutes');
const adminRoutes = require('./routes/adminRoutes');

/**
 * ! Application Configuration
 */
// Load environment variables
dotenv.config();

/**
 * * Express Application Initialization
 */
const app = express();

/**
 * * Middleware Configuration
 */
// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
// Parse JSON request bodies
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * * API Routes
 */
// Health check endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorite-books', favoriteBookRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

/**
 * * Error Handling Middleware
 * ? Catches any unhandled errors in the application
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

/**
 * * Server Initialization
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 