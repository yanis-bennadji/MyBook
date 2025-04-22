import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Notification from '../components/Notification';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (password.length < minLength) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!hasUpperCase) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!hasNumber) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    if (!hasSymbol) {
      return 'Le mot de passe doit contenir au moins un symbole';
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Valider le mot de passe en temps réel
    if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors({
        ...errors,
        password: passwordError
      });
    }
    
    // Vérifier si les mots de passe correspondent
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      setErrors({
        ...errors,
        confirmPassword: 
          name === 'confirmPassword' 
            ? value !== formData.password 
              ? 'Les mots de passe ne correspondent pas' 
              : '' 
            : formData.confirmPassword !== value 
              ? 'Les mots de passe ne correspondent pas' 
              : ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotification(null);

    // Valider le mot de passe
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors({
        ...errors,
        password: passwordError
      });
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: 'Les mots de passe ne correspondent pas'
      });
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      setNotification({
        type: 'success',
        message: 'Inscription réussie ! Un email de vérification a été envoyé à votre adresse email.'
      });

      // Attendre 3 secondes avant de rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-[#0F3D3E]">Inscription</h1>
          <p className="mt-2 text-gray-600">Rejoignez la communauté MyBook</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-in">
            {error}
          </div>
        )}

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 bg-white p-8 rounded-xl shadow-lg animate-scale-in hover-lift"
        >
          <FormInput
            label="Nom d'utilisateur"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choisissez un nom d'utilisateur"
          />

          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Entrez votre email"
          />

          <div>
            <FormInput
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Créez un mot de passe"
              error={errors.password}
            />
            <p className="mt-1 text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un symbole.
            </p>
          </div>

          <FormInput
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirmez votre mot de passe"
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            disabled={isLoading || errors.password || errors.confirmPassword}
            className={`w-full bg-[#0F3D3E] hover:bg-[#0F3D3E]/90 text-white py-2 px-4 rounded-lg transition-all duration-200 hover-scale ${
              (isLoading || errors.password || errors.confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription...
              </div>
            ) : 'S\'inscrire'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 animate-fade-in">
          Déjà un compte ?{' '}
          <Link 
            to="/login" 
            className="font-medium text-[#FFB100] hover:text-[#FFB100]/80 transition-colors duration-200"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 