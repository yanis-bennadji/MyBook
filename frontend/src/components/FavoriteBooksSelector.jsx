import React, { useState } from 'react';
import SearchResultsPage from '../pages/SearchResultsPage';

const FavoriteBooksSelector = ({ selectedBooks = [], onChange }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const MAX_BOOKS = 4;

  const handleAddBook = (book) => {
    const isBookAlreadySelected = selectedBooks.some(
      selected => selected.bookId === book.id
    );

    if (!isBookAlreadySelected && selectedBooks.length < MAX_BOOKS) {
      const newBook = {
        bookId: book.id,
        title: book.title,
        authors: book.authors,
        thumbnail: book.thumbnail,
        position: selectedBooks.length + 1
      };
      onChange([...selectedBooks, newBook]);
      setIsSearchOpen(false);
    }
  };

  const handleRemoveBook = (bookId) => {
    const updatedBooks = selectedBooks.filter(book => book.bookId !== bookId)
      .map((book, index) => ({ ...book, position: index + 1 }));
    onChange(updatedBooks);
  };

  const moveBook = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === selectedBooks.length - 1)
    ) {
      return;
    }

    const newBooks = [...selectedBooks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBooks[index], newBooks[newIndex]] = [newBooks[newIndex], newBooks[index]];
    
    const updatedBooks = newBooks.map((book, idx) => ({
      ...book,
      position: idx + 1
    }));
    
    onChange(updatedBooks);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {selectedBooks.length}/{MAX_BOOKS} livres sélectionnés
        </span>
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          disabled={selectedBooks.length >= MAX_BOOKS}
          className="px-3 py-1 text-sm bg-[#0F3D3E] text-white rounded-md hover:bg-[#0F3D3E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Ajouter un livre
        </button>
      </div>

      <div className="space-y-2">
        {selectedBooks.map((book, index) => (
          <div
            key={book.bookId}
            className="flex items-center p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-12 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="ml-4 flex-grow">
              <h3 className="font-medium text-gray-900">{book.title}</h3>
              <p className="text-sm text-gray-500">
                {book.authors?.join(', ')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => moveBook(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors duration-200"
                title="Monter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveBook(index, 'down')}
                disabled={index === selectedBooks.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors duration-200"
                title="Descendre"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleRemoveBook(book.bookId)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity"
              onClick={() => setIsSearchOpen(false)}
            ></div>

            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl transform transition-all p-6">
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="pt-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ajouter un livre aux favoris
                </h2>
                <div className="mt-2">
                  <SearchResultsPage onBookSelect={handleAddBook} isSelector={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteBooksSelector;