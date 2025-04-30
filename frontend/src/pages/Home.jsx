import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import profileIllustration from '../assets/profile-illustration.png';
import discoverIllustration from '../assets/discover-illustration.png';
import shareIllustration from '../assets/share-illustration.png';

const Home = () => {
  useEffect(() => {
    // Ajouter une classe pour déclencher les animations au chargement
    document.body.classList.add('loaded');
    
    // Nettoyer la classe lors du démontage du composant
    return () => {
      document.body.classList.remove('loaded');
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <main className="pt-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F3D3E] mb-6 animate-slide-in">
                Le carnet de lecture nouvelle génération
              </h1>
              <p className="text-xl text-gray-600 mb-8 animate-fade-in delay-100">
                Grâce à MyBook, découvrez, collectionnez et partagez vos lectures préférées. 
                Une nouvelle façon de vivre votre passion pour la lecture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-200">
                <Link
                  to="/book-search"
                  className="px-6 py-2.5 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0F3D3E]/90 transition-all duration-300 hover-scale text-center"
                >
                  Explorer la bibliothèque
                </Link>
                <button className="px-6 py-2.5 text-[#0F3D3E] font-medium hover:text-[#FFB100] transition-all duration-300 hover-lift">
                  En savoir plus
                </button>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="aspect-square bg-[#0F3D3E]/5 rounded-3xl p-8 hover-lift transition-all duration-300">
                <img 
                  src={logo} 
                  alt="MyBook App Preview" 
                  className="w-full h-full object-contain animate-float" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="comment-ca-marche" className="bg-gradient-to-b from-amber-50 to-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#0F3D3E] mb-16 animate-fade-in">
              Comment ça marche ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover-lift transition-all duration-300 animate-fade-in delay-100">
                <div className="mb-6 h-[240px] flex items-center justify-center">
                  <img 
                    src={profileIllustration} 
                    alt="Personnalisation du profil" 
                    className="w-full h-full object-contain animate-float-slow"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#0F3D3E] mb-4">Créez votre profil</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="animate-slide-in delay-150">• Personnalisez votre compte lecteur</li>
                  <li className="animate-slide-in delay-200">• Ajoutez vos genres préférés</li>
                  <li className="animate-slide-in delay-250">• Définissez vos objectifs de lecture</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover-lift transition-all duration-300 animate-fade-in delay-200">
                <div className="mb-6 h-[240px] flex items-center justify-center">
                  <img 
                    src={discoverIllustration} 
                    alt="Découverte de livres" 
                    className="w-full h-full object-contain animate-float-slow"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#0F3D3E] mb-4">Découvrez des livres</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="animate-slide-in delay-300">• Explorez des millions de livres</li>
                  <li className="animate-slide-in delay-350">• Recherchez par titre ou auteur</li>
                  <li className="animate-slide-in delay-400">• Recevez des recommandations</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover-lift transition-all duration-300 animate-fade-in delay-300">
                <div className="mb-6 h-[240px] flex items-center justify-center">
                  <img 
                    src={shareIllustration} 
                    alt="Partage d'avis sur les livres" 
                    className="w-full h-full object-contain animate-float-slow"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#0F3D3E] mb-4">Partagez vos avis</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="animate-slide-in delay-450">• Notez vos lectures sur 5</li>
                  <li className="animate-slide-in delay-500">• Rédigez des critiques</li>
                  <li className="animate-slide-in delay-550">• Échangez avec la communauté</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Notre mission */}
        
      </main>
    </div>
  );
};

export default Home; 