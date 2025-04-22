import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import statsService from '../../services/statsService';
import { formatDate } from '../../utils/dateUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userStats, activity] = await Promise.all([
          statsService.getUserStats(),
          statsService.getRecentActivity()
        ]);
        setStats(userStats);
        setRecentActivity(activity);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    return `http://localhost:3000${user.avatar_url}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004F4F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête du dashboard */}
      <div className="bg-[#004F4F] rounded-lg shadow-lg p-6 mb-8 text-white transform hover:scale-[1.01] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F4E06D]">
            {getAvatarUrl() ? (
              <img 
                src={getAvatarUrl()} 
                alt={`Avatar de ${user?.username}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#F4E06D] flex items-center justify-center text-2xl font-bold text-[#004F4F]">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bonjour, {user?.username || 'Lecteur'}</h1>
            <p className="text-[#33B4B4]">Tableau de bord lecteur</p>
          </div>
          <div className="ml-auto flex gap-3">
            <span className="text-[#33B4B4] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            <Link to="/profile" className="bg-[#F4E06D] text-[#004F4F] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#F9F6EF] transition duration-300">
              Mon profil
            </Link>
          </div>
        </div>
      </div>
      
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-[#004F4F]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-[#333333]">Livres lus</h3>
            <div className="p-2 bg-[#F9F6EF] rounded-md text-[#004F4F]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#004F4F]">{stats.booksRead}</p>
          <p className="text-sm mt-1 text-[#333333]">Livres terminés</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-[#007C7C]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-[#333333]">Notes</h3>
            <div className="p-2 bg-[#F9F6EF] rounded-md text-[#007C7C]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#007C7C]">{stats.averageRating}</p>
          <p className="text-sm mt-1 text-[#333333]">Note moyenne</p>
          <div className="w-full bg-[#E2E2E2] h-2 rounded-full mt-3">
            <div className="bg-[#007C7C] h-2 rounded-full transition-all duration-1000" style={{ width: `${(stats.averageRating/5)*100}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-[#33B4B4]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-[#333333]">Critiques</h3>
            <div className="p-2 bg-[#F9F6EF] rounded-md text-[#33B4B4]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#33B4B4]">{stats.reviewsWritten}</p>
          <p className="text-sm mt-1 text-[#333333]">Critiques écrites</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-[#F4E06D]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-[#333333]">Objectif</h3>
            <div className="p-2 bg-[#F9F6EF] rounded-md text-[#004F4F]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#F4E06D]">{stats.readingGoalProgress}%</p>
          <p className="text-sm mt-1 text-[#333333]">Objectif de lecture</p>
          <div className="w-full bg-[#E2E2E2] h-2 rounded-full mt-3">
            <div className="bg-[#F4E06D] h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.readingGoalProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#F9F6EF] rounded-md text-[#004F4F]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#333333]">Activité récente</h2>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map(activity => (
            <div key={activity.id} className="flex items-start transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex-shrink-0 mr-4">
                {activity.bookImage ? (
                  <img 
                    src={activity.bookImage} 
                    alt={activity.bookTitle}
                    className="w-16 h-24 object-cover rounded-md shadow-md"
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded-md shadow-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 pb-4 border-b border-[#E2E2E2]">
                <div className="flex justify-between">
                  <h4 className="font-medium text-[#333333]">
                    <Link to={`/book/${activity.bookId}`} className="hover:text-[#007C7C] transition-colors duration-300">
                      {activity.bookTitle}
                    </Link>
                  </h4>
                  <span className="text-xs text-[#666666]">
                    {formatDate(activity.date)}
                  </span>
                </div>
                <div className="text-[#333333] text-sm mt-1">
                  {activity.type === 'review' && (
                    <>
                      <p>Vous avez noté ce livre {activity.rating}/5</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < activity.rating ? 'text-[#F4E06D]' : 'text-[#E2E2E2]'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </>
                  )}
                  {activity.type === 'read' && <p>Vous avez terminé ce livre</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 