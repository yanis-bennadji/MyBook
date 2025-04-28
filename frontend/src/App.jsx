import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { PublicRoute, PrivateRoute } from './components/ProtectedRoutes';
import Header from './components/Header';
import Footer from './components/Footer';
import WelcomePopup from './components/WelcomePopup';
import UserSearch from './components/UserSearch';
import Home from './pages/Home';
import BookDetailsPage from './pages/BookDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ReadBooksPage from './pages/ReadBooksPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './components/admin/AdminDashboard';

/**
 * ! Main Application Component
 * This component serves as the root of the application, setting up:
 * - Authentication context for user management
 * - Routing system with protected routes
 * - Global layout elements (header, footer)
 */
const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

// Separate component for the content that needs auth context
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/book/:bookId" element={<BookDetailsPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/books/read" element={<PrivateRoute><ReadBooksPage /></PrivateRoute>} />
          
          {/* Admin route */}
          <Route
            path="/admin"
            element={
              user?.isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Error routes */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <Footer />
      <WelcomePopup />
      <UserSearch />
    </div>
  );
};

export default App;
