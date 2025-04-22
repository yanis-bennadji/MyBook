import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import statsService from '../services/statsService';
import { formatDate } from '../utils/dateUtils';
import FavoriteBooksList from '../components/FavoriteBooksList';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let userData;
        let userStats;
        let userActivity;
        let userFavorites;

        if (userId) {
          // Récupérer le profil d'un autre utilisateur
          userData = await userService.getProfileById(userId);
          userStats = await statsService.getUserStats(userId);
          userActivity = await statsService.getRecentActivity(userId);
          userFavorites = await userService.getFavoriteBooks(userId);
        } else {
          // Récupérer son propre profil
          userData = await userService.getProfile();
          userStats = await statsService.getUserStats();
          userActivity = await statsService.getRecentActivity();
          userFavorites = await userService.getFavoriteBooks();
        }

        setProfileData(userData);
        setStats(userStats);
        setRecentActivity(userActivity);
        setFavoriteBooks(userFavorites);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const getAvatarUrl = () => {
    if (!profileData?.avatar_url) return null;
    return `http://localhost:3000${profileData.avatar_url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6EF] pt-20 pb-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004F4F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F6EF] pt-20 pb-12 flex justify-center items-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const isOwnProfile = !userId || userId === currentUser.id;

  return (
    <>
      <Helmet>
        <title>{profileData.username} | MyBook</title>
        <meta name="description" content={`Profil de lecteur de ${profileData.username} sur MyBook`} />
      </Helmet>

      <div className="min-h-screen bg-[#F9F6EF] pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête du profil */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-40 bg-[#004F4F] relative">
              <div className="absolute -bottom-16 left-6 flex items-end space-x-6">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-[#F4E06D]">
                  {getAvatarUrl() ? (
                    <img 
                      src={getAvatarUrl()} 
                      alt={`Avatar de ${profileData.username}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#004F4F]">
                      {profileData.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="">
                  <h1 className="text-3xl font-bold">{profileData.username}</h1>
                  <p className="text-[#004F4F]">
                    Membre depuis {formatDate(profileData.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 pt-20 pb-6">
              <div className="flex items-center justify-between">
                <p className="text-[#333333] max-w-2xl">
                  {profileData.bio || "Cet utilisateur n'a pas encore ajouté de biographie."}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="bg-[#004F4F] text-white px-4 py-2 rounded-md hover:bg-[#007C7C] transition-colors duration-300"
                  >
                    Modifier le profil
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {/* Livres favoris - Maintenant en haut et plus compact */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[#333333]">Livres favoris</h2>
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="text-sm text-[#004F4F] hover:text-[#007C7C] transition-colors duration-300"
                  >
                    Modifier
                  </Link>
                )}
              </div>
              <FavoriteBooksList books={favoriteBooks} isOwnProfile={isOwnProfile} />
            </div>

            {/* Grille pour les stats et l'activité récente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Statistiques */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#333333] mb-4">Statistiques</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#333333]">Livres lus</span>
                    <span className="font-bold text-[#004F4F]">{stats.booksRead}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#333333]">Critiques écrites</span>
                    <span className="font-bold text-[#004F4F]">{stats.reviewsWritten}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#333333]">Note moyenne</span>
                    <span className="font-bold text-[#004F4F]">{stats.averageRating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#333333]">Pages lues</span>
                    <span className="font-bold text-[#004F4F]">{stats.totalPages}</span>
                  </div>
                </div>
              </div>

              {/* Activité récente - Maintenant sur 2 colonnes */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#333333]">Activité récente</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recentActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-start bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0 mr-3">
                          {activity.bookImage ? (
                            <img 
                              src={activity.bookImage} 
                              alt={activity.bookTitle}
                              className="w-12 h-16 object-cover rounded shadow"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded shadow flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-[#333333] text-sm truncate">
                              <Link to={`/book/${activity.bookId}`} className="hover:text-[#007C7C] transition-colors duration-300">
                                {activity.bookTitle}
                              </Link>
                            </h4>
                            <span className="text-xs text-[#666666] ml-2 flex-shrink-0">
                              {formatDate(activity.date)}
                            </span>
                          </div>
                          <div className="text-[#333333] text-xs mt-1">
                            {activity.type === 'review' ? (
                              <>
                                <p className="text-xs">{isOwnProfile ? 'Vous avez' : 'A'} noté {activity.rating}/5</p>
                                <div className="flex mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${i < activity.rating ? 'text-[#F4E06D]' : 'text-[#E2E2E2]'}`} viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p>{isOwnProfile ? 'Vous avez' : 'A'} terminé ce livre</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage; 