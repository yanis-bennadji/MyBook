import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        if (query === '') {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await userService.searchUsers(searchQuery);
      setResults(data);
    } catch (err) {
      setError('Erreur lors de la recherche des utilisateurs');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleUserSelect = (userId) => {
    setShowResults(false);
    setQuery('');
    setIsExpanded(false);
    navigate(`/profile/${userId}`);
  };

  const handleSearchClick = () => {
    setIsExpanded(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={searchRef}>
      <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'w-72' : 'w-12'}`}>
        {isExpanded ? (
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Rechercher un utilisateur..."
            className="w-full px-4 py-2 bg-white border rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            onClick={handleSearchClick}
            className="w-12 h-12 flex items-center justify-center bg-[#0F3D3E] hover:bg-[#0f3d3eda] rounded-full shadow-lg text-white transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
        
        {loading && isExpanded && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {showResults && isExpanded && (query || results.length > 0) && (
        <div className="absolute bottom-full mb-2 w-72 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {error ? (
            <div className="p-3 text-red-500">{error}</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="font-medium">{user.username}</div>
                    {user.bio && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {user.bio}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    <div>{user._count.readBooks} livres</div>
                    <div>{user._count.favoriteBooks} favoris</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query && !loading ? (
            <div className="p-3 text-gray-500">Aucun utilisateur trouvé</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearch; 