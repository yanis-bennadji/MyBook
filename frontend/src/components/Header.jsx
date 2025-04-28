import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { getSearchSuggestions } from '../services/googleBooksApi';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

/**
 * ! Header Component
 * Main navigation component that appears on all pages
 * Includes:
 * - Logo and brand
 * - Search functionality with autocomplete suggestions
 * - User authentication controls
 * - Responsive design elements
 */
const Header = () => {
  /**
   * * Component State
   */
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  /**
   * * Refs for DOM elements and timers
   */
  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  
  /**
   * * Auth context and navigation
   */
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * ? Background Effect
   * Changes header appearance on scroll
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * ? Click Outside Effect
   * Handles closing dropdowns when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * * Search Input Handler
   * Debounces search input and fetches suggestions
   */
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (newQuery.length >= 2) {
        fetchSuggestions(newQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  /**
   * * API Call for Suggestions
   * Fetches book suggestions based on user input
   */
  const fetchSuggestions = async (searchQuery) => {
    try {
      const results = await getSearchSuggestions(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Erreur lors de la récupération des suggestions:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * * Suggestion Click Handler
   * Navigates to book details when a suggestion is clicked
   */
  const handleSuggestionClick = (suggestion) => {
    navigate(`/book/${suggestion.id}`);
    setShowSuggestions(false);
    setQuery('');
  };

  /**
   * * Search Form Submit Handler
   * Navigates to search results page
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  /**
   * * Logout Handler
   * Logs out the user and redirects to home
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * * User Menu Toggle
   * Shows/hides the user dropdown menu
   */
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  /**
   * * User Avatar Helpers
   * Functions to safely access user properties
   */
  // Fonction pour obtenir l'initiale de l'utilisateur de manière sécurisée
  const getUserInitial = () => {
    if (!user || !user.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  // Fonction pour obtenir le nom d'utilisateur de manière sécurisée
  const getUsername = () => {
    return user?.username || 'Utilisateur';
  };

  // Fonction pour obtenir l'URL de l'avatar complète
  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    return `http://localhost:3000${user.avatar_url}`;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center" onClick={() => setShowSuggestions(false)}>
            <img src={logo} alt="MyBook Logo" className="h-8 w-auto mr-2" />
            <span className="text-2xl font-bold text-[#0F3D3E]">MyBook</span>
          </Link>

          <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (query.trim()) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#0F3D3E]/20 focus:border-[#FFB100] focus:ring-2 focus:ring-[#FFB100]/20 focus:outline-none transition-all duration-200"
                />
                {!query && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    Rechercher un livre...
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#0F3D3E] hover:text-[#FFB100]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                  >
                    {suggestion.thumbnail && (
                      <img
                        src={suggestion.thumbnail}
                        alt={suggestion.title}
                        className="w-8 h-12 object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-[#0F3D3E]">{suggestion.title}</div>
                      <div className="text-sm text-gray-600">{suggestion.authors.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Administration
                  </Link>
                )}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={toggleUserMenu} 
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      {getAvatarUrl() ? (
                        <img 
                          src={getAvatarUrl()} 
                          alt={`Avatar de ${getUsername()}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0F3D3E] flex items-center justify-center text-white font-medium">
                          {getUserInitial()}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-700 hover:text-[#0F3D3E] transition-colors duration-200">
                      {getUsername()}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#E2E2E2]">
                        <p className="text-sm font-medium text-[#333333]">{getUsername()}</p>
                        <p className="text-xs text-[#007C7C]">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#F9F6EF] hover:text-[#004F4F]"
                      >
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                          Tableau de bord
                        </div>
                      </Link>
                      <Link
                        to="/books/read"
                        className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#F9F6EF] hover:text-[#004F4F]"
                      >
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                          </svg>
                          Mes Livres Lus
                        </div>
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#F9F6EF] hover:text-[#004F4F]"
                      >
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Mon profil
                        </div>
                      </Link>
                      <Link
                        to="/profile/edit"
                        className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#F9F6EF] hover:text-[#004F4F]"
                      >
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Modifier mon profil
                        </div>
                      </Link>
                      <div className="border-t border-[#E2E2E2] mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-[#333333] hover:bg-[#F9F6EF] hover:text-[#004F4F]"
                        >
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            Se déconnecter
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-[#0F3D3E] transition-colors duration-200">
                  Connexion
                </Link>
                <Link to="/register">
                  <Button className="bg-[#0F3D3E] text-white">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 