import React from 'react';
import { Link } from 'react-router-dom';

const FavoriteBooksList = ({ books, isOwnProfile = false }) => {
  const getHighQualityImageUrl = (url) => {
    if (!url) return null;
    let newUrl = url.replace('http://', 'https://');
    newUrl = newUrl.replace('zoom=1', 'zoom=2');
    newUrl = newUrl.replace('&edge=curl', '');
    return newUrl;
  };

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-4 bg-white rounded-lg">
        <p className="text-gray-500 text-sm">Aucun livre favori pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {books.map((book) => (
        <Link
          key={book.bookId}
          to={`/book/${book.bookId}`}
          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <div className="aspect-[2/3] relative">
            {book.thumbnail ? (
              <>
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg" />
                <img
                  src={getHighQualityImageUrl(book.thumbnail)}
                  alt={book.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.src = book.thumbnail;
                  }}
                  onLoad={(e) => {
                    e.target.previousSibling.style.display = 'none';
                  }}
                />
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Image non disponible</span>
              </div>
            )}
            <div className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
              <span className="text-xs font-medium text-[#0F3D3E]">#{book.position}</span>
            </div>
          </div>
          <div className="p-2">
            <h3 className="font-medium text-[#0F3D3E] text-sm line-clamp-1">
              {book.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1">
              {book.authors?.join(', ') || 'Auteur inconnu'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FavoriteBooksList; 