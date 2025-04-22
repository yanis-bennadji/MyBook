import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Si l'utilisateur est authentifié, rediriger vers la page d'accueil
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}; 