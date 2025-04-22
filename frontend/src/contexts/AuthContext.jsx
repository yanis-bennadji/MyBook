import React, { createContext, useState, useContext, useEffect } from 'react';
import Notification from '../components/Notification';
import authService from '../services/authService';

const AuthContext = createContext();

// Fonction pour obtenir l'état initial de l'authentification
const getInitialAuthState = () => {
  const user = authService.getCurrentUser();
  return {
    user,
    isAuthenticated: !!user
  };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialAuthState());
  const [notification, setNotification] = useState(null);

  const login = (userData) => {
    if (!userData || !userData.token) {
      setNotification({
        message: 'Erreur de connexion : token manquant',
        type: 'error'
      });
      return;
    }

    setAuthState({ user: userData, isAuthenticated: true });
    setNotification({
      message: 'Connexion réussie ! Bienvenue !',
      type: 'success'
    });
  };

  const updateUser = (userData) => {
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }));
    // Mettre à jour le localStorage
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...userData
      }));
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({ user: null, isAuthenticated: false });
    setNotification({
      message: 'Vous avez été déconnecté avec succès.',
      type: 'info'
    });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setAuthState({ user, isAuthenticated: true });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user: authState.user, 
      isAuthenticated: authState.isAuthenticated, 
      login,
      logout,
      updateUser
    }}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 