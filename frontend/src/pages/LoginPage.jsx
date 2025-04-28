import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickLogin = () => {
    setCredentials({
      email: 'yanis.bennadji27@gmail.com',
      password: 'Admin123!'
    });
  };

  const handleAdminLogin = () => {
    setCredentials({
      email: 'admin@mybook.com',
      password: 'Admin@2024'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await authService.login(credentials);
      login(userData);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-[#0F3D3E]">Connexion</h1>
          <p className="mt-2 text-gray-600">Bienvenue sur MyBook</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-in">
            {error}
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 bg-white p-8 rounded-xl shadow-lg animate-scale-in hover-lift"
        >
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            placeholder="Entrez votre email"
          />

          <FormInput
            label="Mot de passe"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            placeholder="Entrez votre mot de passe"
          />

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F3D3E] text-white"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleQuickLogin}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Connexion rapide
              </Button>

              <Button
                type="button"
                onClick={handleAdminLogin}
                className="flex-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              >
                Admin
              </Button>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-[#0F3D3E] hover:text-[#0F3D3E]/80 font-medium transition-colors duration-200"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 