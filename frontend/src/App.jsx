import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/book/:bookId" element={<BookDetailsPage />} />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  } 
                />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile/edit" 
                  element={
                    <PrivateRoute>
                      <EditProfilePage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile/:userId" 
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/books/read" 
                  element={
                    <PrivateRoute>
                      <ReadBooksPage />
                    </PrivateRoute>
                  } 
                />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Footer />
            <WelcomePopup />
            <UserSearch />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
