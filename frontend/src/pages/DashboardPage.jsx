import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/dashboard/Dashboard';

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Si l'utilisateur n'est pas authentifié, ne rien rendre
  // La redirection se fera via l'useEffect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Votre Tableau de Bord | MyBook</title>
        <meta name="description" content="Consultez vos statistiques de lecture et votre activité récente sur MyBook" />
      </Helmet>
      <div className="pt-20 pb-12 bg-[#F9F9F9] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Dashboard />
        </div>
      </div>
    </>
  );
};

export default DashboardPage; 