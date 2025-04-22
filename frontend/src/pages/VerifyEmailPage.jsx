import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {status === 'error' ? 'Erreur' : 'Vérification'}
          </h2>
          <p className={`mt-2 text-center text-sm ${
            status === 'error' ? 'text-red-600' : 
            status === 'success' ? 'text-green-600' : 
            'text-gray-600'
          }`}>
            {error || message}
          </p>
          {status === 'success' && (
            <p className="mt-2 text-center text-sm text-gray-500">
              Redirection vers la page de connexion dans quelques secondes...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 