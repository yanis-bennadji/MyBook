import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import favoriteBookService from '../services/favoriteBookService';
import { Helmet } from 'react-helmet-async';
import FavoriteBooksSelector from '../components/FavoriteBooksSelector';

const EditProfilePage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const fileInputRef = useRef();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch favorite books on component mount
  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      try {
        if (!isAuthenticated) return; // Don't fetch if not authenticated
        const books = await favoriteBookService.getFavoriteBooks();
        setFavoriteBooks(books);
      } catch (err) {
        console.error('Error fetching favorite books:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchFavoriteBooks();
  }, [isAuthenticated, navigate]);

  const handleFavoriteBooksChange = async (books) => {
    try {
      // Find removed books (those that are in favoriteBooks but not in the new books array)
      const removedBooks = favoriteBooks.filter(favBook => 
        !books.some(book => book.bookId === favBook.bookId)
      );

      // Remove books first
      for (const book of removedBooks) {
        await favoriteBookService.removeFavoriteBook(book.bookId);
      }

      // Find new books (those that are not in favoriteBooks)
      const newBooks = books.filter(book => 
        !favoriteBooks.some(favBook => favBook.bookId === book.bookId)
      );

      // Add new books
      for (const book of newBooks) {
        await favoriteBookService.addFavoriteBook(book.bookId);
      }

      // Then update positions if there are any books left
      if (books.length > 0) {
        await favoriteBookService.updateFavoriteBooks(books);
      }
      
      // Refresh the list of favorites
      const updatedBooks = await favoriteBookService.getFavoriteBooks();
      setFavoriteBooks(updatedBooks);
    } catch (err) {
      console.error('Error updating favorite books:', err);
      setError('Une erreur est survenue lors de la mise à jour des livres favoris.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Créer une URL temporaire pour la prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('bio', formData.bio);
      
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const updatedUser = await userService.updateProfile(formDataToSend);
      updateUser(updatedUser);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Modifier mon profil | MyBook</title>
      </Helmet>

      <div className="min-h-screen bg-[#F9F6EF] pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-[#0F3D3E] mb-6">
              Modifier mon profil
            </h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil
                </label>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                    {formData.avatar ? (
                      <img
                        src={URL.createObjectURL(formData.avatar)}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#0F3D3E] text-white text-3xl font-bold">
                        {formData.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F3D3E]"
                  >
                    Changer la photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label 
                  htmlFor="bio" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Biographie
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
                  placeholder="Parlez-nous un peu de vous..."
                />
              </div>

              {/* Favorite Books */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Livres favoris
                </label>
                <FavoriteBooksSelector 
                  selectedBooks={favoriteBooks}
                  onChange={handleFavoriteBooksChange}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#0F3D3E] text-white rounded-md hover:bg-[#0F3D3E]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F3D3E] disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfilePage; 