import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import collectionService from '../services/collectionService';
import reviewService from '../services/reviewService';
import { getBookDetails } from '../services/googleBooksApi';
import BookSearch from '../components/BookSearch';

const ReadBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({
    finishDate: new Date().toISOString().split('T')[0],
    rating: 0,
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(null);
  const [addingBook, setAddingBook] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const booksData = await collectionService.getUserBooks();
      const reviewsData = await reviewService.getUserReviews();

      // Fusionner les livres avec leurs reviews
      const booksWithReviews = booksData.map(book => {
        const review = reviewsData.find(r => r.bookId === book.bookId);
        return {
          ...book,
          review
        };
      });

      setBooks(booksWithReviews);
    } catch (err) {
      setError('Une erreur est survenue lors de la récupération de vos livres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      monthShort: months[date.getMonth()].substring(0, 3).toUpperCase(),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      timestamp: date.getTime()
    };
  };

  const handleAddBook = async (bookId) => {
    try {
      setAddingBook(true);
      const bookDetails = await getBookDetails(bookId);
      await collectionService.addBook(bookId);
      setSelectedBook({ 
        bookId,
        bookDetails: {
          title: bookDetails.volumeInfo.title,
          authors: bookDetails.volumeInfo.authors,
          imageLinks: bookDetails.volumeInfo.imageLinks
        }
      });
      setEditForm({
        finishDate: new Date().toISOString().split('T')[0],
        rating: 0,
        comment: ''
      });
      setShowAddModal(false);
      setShowEditModal(true);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'ajout du livre');
    } finally {
      setAddingBook(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        bookId: selectedBook.bookId,
        rating: parseFloat(editForm.rating),
        comment: editForm.comment,
        finishDate: new Date(editForm.finishDate).toISOString()
      };

      if (selectedBook.review) {
        await reviewService.updateReview(selectedBook.review.id, reviewData);
      } else {
        await reviewService.createReview(reviewData);
      }

      await fetchBooks();
      setShowEditModal(false);
      setSelectedBook(null);
    } catch (err) {
      console.error('Erreur lors de la modification de la review:', err);
      setError('Une erreur est survenue lors de la modification de la review');
    }
  };

  const handleBookClick = (book) => {
    if (book.review) {
      setSelectedReview(book);
      setShowReviewModal(true);
    } else {
      handleEditClick(book);
    }
  };

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setEditForm({
      finishDate: book.review?.finishDate 
        ? new Date(book.review.finishDate).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      rating: book.review?.rating || 0,
      comment: book.review?.comment || ''
    });
    setShowEditModal(true);
  };

  const handleRemoveBook = (book) => {
    setBookToDelete(book);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await collectionService.removeBook(bookToDelete.bookId);
      await fetchBooks(); // Rafraîchir la liste
      setShowDeleteConfirm(false);
      setBookToDelete(null);
    } catch (err) {
      setError('Une erreur est survenue lors de la suppression du livre');
    }
  };

  const renderRatingStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const isHalfStar = rating === index + 0.5;
          const isFilled = rating >= starValue;

          return (
            <div key={index} className="relative">
              {isHalfStar ? (
                <div className="relative">
                  <span className="text-lg text-gray-300">★</span>
                  <span className="absolute left-0 top-0 text-lg text-[#FFB100] overflow-hidden w-[50%]">★</span>
                </div>
              ) : (
                <span className={`text-lg ${isFilled ? 'text-[#FFB100]' : 'text-gray-300'}`}>★</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderEditableStars = () => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const rating = hoverRating !== null ? hoverRating : editForm.rating;
          const isHalfStar = rating === index + 0.5;
          const isFilled = rating >= starValue;

          return (
            <div
              key={index}
              className="relative cursor-pointer"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const halfWidth = rect.width / 2;
                
                if (x < halfWidth) {
                  setHoverRating(index + 0.5);
                } else {
                  setHoverRating(index + 1);
                }
              }}
              onMouseLeave={() => setHoverRating(null)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const halfWidth = rect.width / 2;
                
                const newRating = x < halfWidth ? index + 0.5 : index + 1;
                setEditForm({ ...editForm, rating: newRating });
                setHoverRating(null);
              }}
            >
              <div className="relative">
                <span className="text-2xl text-gray-300">★</span>
                {(isHalfStar || isFilled) && (
                  <span 
                    className={`absolute left-0 top-0 text-2xl overflow-hidden transition-all duration-100 ${
                      hoverRating !== null ? 'text-[#FFB100]/80' : 'text-[#FFB100]'
                    } ${isHalfStar ? 'w-[50%]' : 'w-full'}`}
                  >
                    ★
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBookCard = (book) => {
    const date = formatDate(book.review?.finishDate);
    return (
      <div 
        key={book.bookId} 
        className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        onClick={() => handleBookClick(book)}
      >
        {/* Date */}
        <div className="w-24 text-center border-r border-gray-200 pr-4">
          {date ? (
            <>
              <div className="text-sm text-gray-500">{date.monthShort}</div>
              <div className="text-2xl font-bold text-gray-700">{date.day}</div>
              <div className="text-sm text-gray-500">{date.year}</div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Date non spécifiée</div>
          )}
        </div>

        {/* Livre */}
        <div className="flex-1 flex items-center px-4">
          <img
            src={book.bookDetails.imageLinks?.thumbnail}
            alt={book.bookDetails.title}
            className="w-16 h-24 object-cover rounded shadow-sm"
          />
          <div className="ml-4">
            <Link 
              to={`/book/${book.bookId}`}
              className="text-lg font-semibold text-[#0F3D3E] hover:text-[#0F3D3E]/80"
            >
              {book.bookDetails.title}
            </Link>
            <p className="text-gray-600">{book.bookDetails.authors?.join(', ')}</p>
            {book.review && (
              <div className="mt-2">
                {renderRatingStars(book.review.rating)}
                {book.review.comment && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {book.review.comment}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div 
          className="flex items-center gap-2 pl-4 border-l border-gray-200"
          onClick={(e) => e.stopPropagation()} // Empêcher l'ouverture du modal de review
        >
          <button 
            onClick={() => handleEditClick(book)}
            className="p-2 text-gray-400 hover:text-[#0F3D3E] transition-colors"
            title="Modifier la review"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            onClick={() => handleRemoveBook(book)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Retirer de la collection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFB100] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const groupedBooks = books.reduce((acc, book) => {
    if (!book.review?.finishDate) {
      // Créer un groupe pour les livres sans date de fin
      const key = 'no-date';
      if (!acc[key]) {
        acc[key] = {
          year: 'Sans date',
          month: 'Non spécifiée',
          books: []
        };
      }
      acc[key].books.push(book);
      return acc;
    }
    
    const date = formatDate(book.review.finishDate);
    const key = `${date.year}-${String(date.monthIndex).padStart(2, '0')}`;
    
    if (!acc[key]) {
      acc[key] = {
        year: date.year,
        month: date.month,
        books: []
      };
    }
    acc[key].books.push(book);
    return acc;
  }, {});

  const sortedGroups = Object.entries(groupedBooks)
    .sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F3D3E]">Mes Livres Lus</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0F3D3E]/90 transition-colors"
          >
            Ajouter un livre
          </button>
        </div>

        <div className="space-y-12">
          {sortedGroups.map(([key, group]) => (
            <div key={key}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-[#0F3D3E]">
                  {group.month} {group.year}
                </h2>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div className="space-y-4">
                {group.books.map(book => renderBookCard(book))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de review */}
      {showReviewModal && selectedReview && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/20 backdrop-blur-[2px] transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReviewModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-lg animate-modal-slide-up"
            style={{
              animation: 'modal-slide-up 0.3s ease-out'
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0F3D3E]">Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-6 mb-6">
              <img
                src={selectedReview.bookDetails.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Image+non+disponible'}
                alt={selectedReview.bookDetails.title}
                className="w-32 h-48 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#0F3D3E] mb-2">
                  {selectedReview.bookDetails.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedReview.bookDetails.authors?.join(', ')}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {renderRatingStars(selectedReview.review.rating)}
                  </div>
                  <span className="text-gray-500">
                    ({selectedReview.review.rating.toFixed(1)})
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Lu le {formatDate(selectedReview.review.finishDate)?.day} {formatDate(selectedReview.review.finishDate)?.month} {formatDate(selectedReview.review.finishDate)?.year}
                </p>
              </div>
            </div>

            {selectedReview.review.comment && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-[#0F3D3E] mb-3">
                  Mon avis
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedReview.review.comment}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  handleEditClick(selectedReview);
                }}
                className="px-4 py-2 text-[#0F3D3E] hover:bg-[#0F3D3E]/10 rounded-lg transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0F3D3E]/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de livre */}
      {showAddModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/20 backdrop-blur-[2px] transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-lg animate-modal-slide-up"
            style={{
              animation: 'modal-slide-up 0.3s ease-out'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#0F3D3E]">Ajouter un livre</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {addingBook ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F3D3E]"></div>
              </div>
            ) : (
              <BookSearch onBookSelect={handleAddBook} />
            )}
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedBook && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/20 backdrop-blur-[2px] transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-lg animate-modal-slide-up"
            style={{
              animation: 'modal-slide-up 0.3s ease-out'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#0F3D3E]">
                {selectedBook.review ? 'Modifier' : 'Ajouter'} la review
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={selectedBook.bookDetails.imageLinks?.thumbnail}
                  alt={selectedBook.bookDetails.title}
                  className="w-16 h-24 object-cover rounded shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedBook.bookDetails.title}</h3>
                  <p className="text-gray-600">{selectedBook.bookDetails.authors?.join(', ')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin de lecture
                </label>
                <input
                  type="date"
                  value={editForm.finishDate}
                  onChange={(e) => setEditForm({ ...editForm, finishDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB100]/20 focus:border-[#FFB100]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                {renderEditableStars()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB100]/20 focus:border-[#FFB100]"
                  rows="4"
                  placeholder="Votre avis sur le livre..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0F3D3E]/90 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && bookToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/20 backdrop-blur-[2px] transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
              setBookToDelete(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg animate-modal-slide-up"
            style={{
              animation: 'modal-slide-up 0.3s ease-out'
            }}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirmer la suppression
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Êtes-vous sûr de vouloir supprimer ce livre de votre collection ?
                </p>
                <p className="font-medium text-gray-900">
                  {bookToDelete.bookDetails.title}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setBookToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-modal-slide-up {
          animation: modal-slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReadBooksPage; 