import React, { createContext, useState, useContext, useEffect } from 'react';
import Notification from '../components/Notification';
import authService from '../services/authService';

/**
 * ! Authentication Context
 * Provides global access to authentication state and operations.
 * Manages user session persistence and notifications.
 */
const AuthContext = createContext();

/**
 * ? Helper Function - Initial Auth State
 * Retrieves the persisted authentication state from localStorage
 * @returns {Object} The initial authentication state object
 */
const getInitialAuthState = () => {
  const user = authService.getCurrentUser();
  return {
    user,
    isAuthenticated: !!user
  };
};

/**
 * * Auth Provider Component
 * Wraps the application with authentication context
 * @param {Object} props Component props
 * @param {ReactNode} props.children Child components
 */
export const AuthProvider = ({ children }) => {
  /**
   * * State Management
   */
  const [authState, setAuthState] = useState(getInitialAuthState());
  const [notification, setNotification] = useState(null);

  /**
   * * Login Handler
   * Authenticates the user and updates global state
   * @param {Object} userData User data including auth token
   */
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

  /**
   * * Update User Handler
   * Updates user profile information in state and localStorage
   * @param {Object} userData Updated user data
   */
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

  /**
   * * Logout Handler
   * Terminates the user session and clears state
   */
  const logout = () => {
    authService.logout();
    setAuthState({ user: null, isAuthenticated: false });
    setNotification({
      message: 'Vous avez été déconnecté avec succès.',
      type: 'info'
    });
  };

  /**
   * ? Notification Clear Handler
   * Removes the current notification from display
   */
  const clearNotification = () => {
    setNotification(null);
  };

  /**
   * ? Auth Persistence Effect
   * Restores auth state from localStorage on app initialization
   */
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

/**
 * * Auth Hook
 * Custom hook to access auth context from any component
 * @returns {Object} Authentication context values
 */
export const useAuth = () => useContext(AuthContext); 