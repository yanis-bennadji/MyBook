import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchBooks } from '../services/googleBooksApi';

const SearchResultsPage = ({ onBookSelect, isSelector }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');  // Nouvel état local pour le mode sélecteur

  useEffect(() => {
    const query = searchParams.get('q');
    if (!isSelector && query) {
      document.title = `Recherche: ${query} | MyBook`;
      handleSearch(query);
    }
  }, [searchParams, isSelector]);

  const getHighQualityImageUrl = (url) => {
    if (!url) return null;
    let newUrl = url.replace('http://', 'https://');
    newUrl = newUrl.replace('zoom=1', 'zoom=2');
    newUrl = newUrl.replace('&edge=curl', '');
    return newUrl;
  };

  const handleSearch = async (value) => {
    if (!value.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const { results, error } = await searchBooks(value);
      if (error) {
        setError(error);
        setBooks([]);
      } else {
        setBooks(results || []);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (isSelector) {
      setSearchQuery(value);
      if (value.length >= 3) {
        handleSearch(value);
      } else {
        setBooks([]);
      }
    } else {
      setSearchParams({ q: value });
    }
  };

  const renderBook = (book) => {
    const BookWrapper = isSelector ? 'div' : Link;
    const bookProps = isSelector ? {
      onClick: () => onBookSelect(book),
      className: "block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    } : {
      to: `/book/${book.id}`,
      className: "block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    };

    return (
      <BookWrapper key={book.id} {...bookProps}>
        <div className="aspect-[2/3] relative">
          {book.thumbnail ? (
            <>
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg" />
              <img
                src={getHighQualityImageUrl(book.thumbnail)}
                alt={book.title}
                className="w-full h-full object-cover rounded-t-lg transition-opacity duration-200"
                onError={(e) => {
                  e.target.src = book.thumbnail;
                }}
                onLoad={(e) => {
                  e.target.previousSibling.style.display = 'none';
                }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
              <span className="text-gray-400">Image non disponible</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#0F3D3E] mb-2 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {book.authors?.join(', ') || 'Auteur inconnu'}
          </p>
          {book.averageRating && (
            <div className="flex items-center gap-1 text-[#FFB100]">
              {[...Array(Math.round(book.averageRating))].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
          )}
        </div>
      </BookWrapper>
    );
  };

  if (!isSelector && !searchParams.get('q')) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">Veuillez saisir un terme de recherche.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isSelector ? "" : "min-h-screen bg-white"}>
      <div className={isSelector ? "" : "pt-24"}>
        <div className={isSelector ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
          {isSelector ? (
            <div className="mb-6">
              <input
                type="text"
                value={isSelector ? searchQuery : (searchParams.get('q') || '')}
                onChange={handleInputChange}
                placeholder="Rechercher un livre..."
                className="w-full px-4 py-2 border-2 rounded-lg transition-all duration-200 border-[#0F3D3E]/20 focus:ring-2 focus:ring-[#FFB100]/20 focus:border-[#FFB100] focus:outline-none"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-[#0F3D3E] mb-8">
              Résultats pour "{searchParams.get('q')}"
            </h1>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFB100] border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              {error}
            </div>
          ) : books.length === 0 ? (
            searchParams.get('q')?.length >= 3 ? (
              <div className="text-center py-4">
                Aucun résultat trouvé pour "{searchParams.get('q')}"
              </div>
            ) : null
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map(renderBook)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;