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
 * * Auth Provider Component
 * Wraps the application with authentication context
 * @param {Object} props Component props
 * @param {ReactNode} props.children Child components
 */
export const AuthProvider = ({ children }) => {
  /**
   * * State Management
   */
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [notification, setNotification] = useState(null);

  /**
   * * Login Handler
   * Authenticates the user and updates global state
   * @param {Object} userData User data
   */
  const login = (userData) => {
    if (!userData) {
      setNotification({
        message: 'Erreur de connexion : données utilisateur manquantes',
        type: 'error'
      });
      return;
    }

    setAuthState({
      user: userData,
      isAuthenticated: true,
      isLoading: false
    });
    setNotification({
      message: 'Connexion réussie ! Bienvenue !',
      type: 'success'
    });
  };

  /**
   * * Update User Handler
   * Updates user profile information in state
   * @param {Object} userData Updated user data
   */
  const updateUser = (userData) => {
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }));
  };

  /**
   * * Logout Handler
   * Terminates the user session and clears state
   */
  const logout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
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
   * Checks authentication status on mount and after refreshes
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  if (authState.isLoading) {
    return <div>Chargement...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ 
      user: authState.user, 
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
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