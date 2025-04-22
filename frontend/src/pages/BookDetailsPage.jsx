import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetails } from '../services/googleBooksApi';
import { useAuth } from '../contexts/AuthContext';
import reviewService from '../services/reviewService';
import collectionService from '../services/collectionService';
import parse from 'html-react-parser';
import Modal from '../components/Modal';
import Button from '../components/Button';

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [isInCollection, setIsInCollection] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [collectionError, setCollectionError] = useState(null);
  const [editForm, setEditForm] = useState({
    finishDate: new Date().toISOString().split('T')[0],
    rating: 0,
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    document.title = loading 
      ? 'Chargement... | MyBook' 
      : book?.volumeInfo?.title 
        ? `${book.volumeInfo.title} | MyBook` 
        : 'MyBook';
  }, [loading, book]);

  const cleanDescription = (text) => {
    if (!text) return 'Aucune description disponible';
    
    // Décoder les entités HTML
    const decodedText = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Utiliser html-react-parser pour nettoyer le HTML
    const options = {
      replace: (domNode) => {
        if (domNode.type === 'tag') {
          return domNode.children.map(child => child.data).join(' ');
        }
      }
    };
    
    const parsedText = parse(decodedText, options);
    return parsedText;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Non spécifiée';
    }
  };

  const getLanguageName = (code) => {
    if (!code) return 'Non spécifiée';
    
    const languageNames = {
      'fr': 'Français',
      'en': 'Anglais',
      'es': 'Espagnol',
      'de': 'Allemand',
      'it': 'Italien',
      'pt': 'Portugais',
      'nl': 'Néerlandais',
      'ru': 'Russe',
      'ja': 'Japonais',
      'zh': 'Chinois',
      'ar': 'Arabe',
      'ko': 'Coréen',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'pl': 'Polonais',
      'tr': 'Turc',
      'vi': 'Vietnamien',
      'th': 'Thaï',
      'el': 'Grec',
      'he': 'Hébreu',
      'sv': 'Suédois',
      'da': 'Danois',
      'fi': 'Finnois',
      'no': 'Norvégien',
      'cs': 'Tchèque',
      'hu': 'Hongrois',
      'ro': 'Roumain',
      'uk': 'Ukrainien',
      'id': 'Indonésien',
      'ms': 'Malais',
      'fa': 'Persan',
      'ur': 'Ourdou',
      'ta': 'Tamoul',
      'te': 'Télougou',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Pendjabi'
    };

    return languageNames[code.toLowerCase()] || code;
  };

  const getHighQualityImageUrl = (url) => {
    if (!url) return null;
    // Remplacer http par https pour éviter les problèmes de sécurité
    let newUrl = url.replace('http://', 'https://');
    // Remplacer zoom=1 par zoom=2 pour une meilleure qualité
    newUrl = newUrl.replace('zoom=1', 'zoom=2');
    // Supprimer edge=curl qui peut causer des problèmes
    newUrl = newUrl.replace('&edge=curl', '');
    console.log('Image URL:', newUrl); // Pour déboguer
    return newUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data for bookId:', bookId);
        
        const [bookData, reviewsData] = await Promise.all([
          getBookDetails(bookId),
          reviewService.getBookReviews(bookId).catch(() => [])
        ]);
        
        console.log('Book data:', bookData);
        setBook(bookData);
        setReviews(reviewsData);
        
        if (isAuthenticated && user) {
          const hasReviewed = reviewsData.some(review => review.userId === user.id);
          setUserHasReviewed(hasReviewed);
          
          // Vérifier si le livre est déjà dans la collection
          try {
            const userBooks = await collectionService.getUserBooks();
            console.log('User books:', userBooks);
            const bookInCollection = userBooks.some(book => book.bookId === bookId);
            console.log('Book in collection:', bookInCollection);
            setIsInCollection(bookInCollection);
          } catch (err) {
            console.error('Erreur lors de la vérification de la collection:', err);
            setError('Erreur lors de la vérification de la collection');
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Une erreur est survenue lors de la récupération des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, isAuthenticated, user]);

  const handleAddToCollection = async () => {
    try {
      setAddingToCollection(true);
      setCollectionError(null);
      console.log('Adding book to collection:', bookId);
      
      await collectionService.addBook(bookId);
      console.log('Book added successfully');

      // Si une note et un commentaire ont été ajoutés, créer la review
      if (editForm.rating > 0) {
        const reviewData = {
          bookId,
          rating: parseFloat(editForm.rating),
          comment: editForm.comment,
          finishDate: new Date(editForm.finishDate).toISOString()
        };
        await reviewService.createReview(reviewData);
      }

      setIsInCollection(true);
      setShowCollectionForm(false);
      
      // Rafraîchir les reviews si une nouvelle a été ajoutée
      const updatedReviews = await reviewService.getBookReviews(bookId);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livre:', error);
      setCollectionError(error.message || 'Une erreur est survenue lors de l\'ajout du livre');
    } finally {
      setAddingToCollection(false);
    }
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

  const renderReviews = () => {
    if (reviews.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          Aucune critique pour le moment. Soyez le premier à donner votre avis !
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0F3D3E] flex items-center justify-center text-white">
                {review.user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium">{review.user.username}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl ${
                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
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

    if (error || !book) {
      return (
        <div className="min-h-screen bg-white pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-500">
              {error || 'Une erreur est survenue lors du chargement du livre.'}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Afficher les erreurs générales */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 p-8 flex justify-center">
                <img
                  src={book.volumeInfo?.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Image+non+disponible'}
                  alt={book.volumeInfo?.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="p-8 md:w-2/3">
                <h1 className="text-3xl font-bold text-[#0F3D3E] mb-2">{book.volumeInfo?.title}</h1>
                <p className="text-xl text-gray-600 mb-4">{book.volumeInfo?.authors?.join(', ')}</p>
                {book.volumeInfo?.averageRating && (
                  <div className="flex items-center gap-1 text-[#FFB100] mb-4">
                    {[...Array(Math.round(book.volumeInfo.averageRating))].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
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
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">{cleanDescription(book.volumeInfo?.description)}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Éditeur:</span> {book.volumeInfo?.publisher || 'Non spécifié'}
                    </div>
                    <div>
                      <span className="font-medium">Date de publication:</span> {formatDate(book.volumeInfo?.publishedDate)}
                    </div>
                    <div>
                      <span className="font-medium">Pages:</span> {book.volumeInfo?.pageCount || 'Non spécifié'}
                    </div>
                    <div>
                      <span className="font-medium">Langue:</span> {getLanguageName(book.volumeInfo?.language)}
                    </div>
                  </div>
                </div>
                {book.volumeInfo?.previewLink && (
                  <div className="mt-6">
                    <a
                      href={book.volumeInfo.previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0F3D3E]/90 transition-colors"
                    >
                      Voir sur Google Books
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0F3D3E]">Critiques</h2>
              {isAuthenticated ? (
                !isInCollection && (
                  <Button
                    onClick={() => setShowCollectionForm(true)}
                    className="bg-[#0F3D3E] text-white"
                  >
                    Ajouter à ma collection
                  </Button>
                )
              ) : (
                <p className="text-sm text-gray-500">Connectez-vous pour ajouter ce livre à votre collection</p>
              )}
            </div>
            {renderReviews()}
          </div>

          <Modal isOpen={showCollectionForm} onClose={() => setShowCollectionForm(false)}>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#0F3D3E]">
                  Ajouter à ma collection
                </h2>
                <button
                  onClick={() => setShowCollectionForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {collectionError && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {collectionError}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleAddToCollection(); }} className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
                  <img
                    src={book?.volumeInfo?.imageLinks?.thumbnail}
                    alt={book?.volumeInfo?.title}
                    className="w-16 h-24 object-cover rounded shadow-sm"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{book?.volumeInfo?.title}</h3>
                    <p className="text-gray-600">{book?.volumeInfo?.authors?.join(', ')}</p>
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB100]/20 focus:border-[#FFB100] bg-white/50 backdrop-blur-sm"
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB100]/20 focus:border-[#FFB100] bg-white/50 backdrop-blur-sm"
                    rows="4"
                    placeholder="Votre avis sur le livre..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowCollectionForm(false)}
                    className="bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/70"
                    disabled={addingToCollection}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#0F3D3E] text-white hover:bg-[#0F3D3E]/90"
                    disabled={addingToCollection}
                  >
                    {addingToCollection ? 'Ajout en cours...' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    );
  };

  return renderContent();
};

export default BookDetailsPage; 