import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const WelcomePopup = () => {
  const { showWelcomePopup, user } = useAuth();

  if (!showWelcomePopup) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
      <p className="text-lg font-semibold">Bienvenue, {user?.username} !</p>
    </div>
  );
};

export default WelcomePopup; 