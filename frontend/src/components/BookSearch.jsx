import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchBooks, getSearchSuggestions, getBookDetails } from '../services/googleBooksApi';

const BookSearch = ({ onBookSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const searchTimeout = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const handleBookSelect = async (book) => {
    if (!book) return;
    
    // Quand un livre est sélectionné depuis l'autocomplétion, récupérons ses détails complets
    try {
      setLoading(true);
      const bookDetails = await getBookDetails(book.id);
      const completeBook = {
        id: bookDetails.id,
        title: bookDetails.volumeInfo.title,
        authors: bookDetails.volumeInfo.authors || [],
        description: bookDetails.volumeInfo.description,
        thumbnail: bookDetails.volumeInfo.imageLinks?.thumbnail,
        averageRating: bookDetails.volumeInfo.averageRating,
        publisher: bookDetails.volumeInfo.publisher,
        publishedDate: bookDetails.volumeInfo.publishedDate,
      };
      setSelectedBook(completeBook);
    } catch (err) {
      console.error("Erreur lors de la récupération des détails:", err);
      setSelectedBook(book); // Fallback sur les données partielles
    } finally {
      setLoading(false);
    }
    
    setQuery(book.title);
    setShowResults(false);
  };

  const handleAddBook = () => {
    if (selectedBook && onBookSelect) {
      onBookSelect(selectedBook.id);
      setQuery('');
      setSelectedBook(null);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
    setSelectedBook(null);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.trim().length >= 3) {
      // Nous n'avons pas besoin de setTimeout ici car getSearchSuggestions 
      // intègre déjà un debouncing de 300ms
      setLoading(true);
      getSearchSuggestions(value)
        .then(suggestions => {
          setResults(suggestions);
          setShowResults(suggestions.length > 0);
        })
        .catch(err => {
          console.error("Erreur autocomplétion:", err);
          setError('Erreur lors de la recherche de suggestions');
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim().length >= 3 && results.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Rechercher un livre..."
            className={`w-full px-4 py-2 border-2 rounded-lg transition-all duration-200 ${
              error 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-[#0F3D3E]/20 focus:ring-2 focus:ring-[#FFB100]/20 focus:border-[#FFB100]'
            } focus:outline-none`}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-[#0F3D3E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddBook}
          disabled={!selectedBook}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !selectedBook
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#0F3D3E] text-white hover:bg-[#0F3D3E]/90'
          }`}
        >
          Ajouter
        </button>
      </div>

      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((book) => (
            book && book.id && (
              <div
                key={book.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-100 transition-colors cursor-pointer ${
                  selectedBook?.id === book.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleBookSelect(book)}
              >
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/128x192?text=Image+non+disponible';
                    }}
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-gray-600">
                    {book.authors?.join(', ')}
                  </p>
                  {book.averageRating && (
                    <div className="flex items-center mt-1">
                      <span className="text-[#FFB100]">★</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {book.averageRating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSearch; 