import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL;

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Vérification en cours...');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_URL}/verify-email/${token}`);
        setMessage(response.data.message);
        setStatus('success');
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Erreur détaillée:', error.response?.data || error);
        setStatus('error');
        if (error.response?.status === 400) {
          // Si c'est une erreur 400, c'est probablement que le token est invalide
          setError(error.response.data.message || 'Token de vérification invalide');
        } else {
          setError('Une erreur est survenue lors de la vérification');
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          {status === 'pending' && (
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFB100] border-t-transparent mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="text-green-600 text-xl font-semibold">
              ✓ {message}
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-600 text-xl font-semibold">
              ✕ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 