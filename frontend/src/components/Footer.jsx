import React from 'react';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#0F3D3E] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-8 md:mb-0">
          <img src={logo} alt="MyBook Logo" className="w-8 h-8" />
            <span className="text-xl font-bold">MyBook</span>
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div>
              <h4 className="font-semibold mb-4 text-[#FFB100]">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="#comment-ca-marche" className="text-white/80 no-underline hover:text-[#FFB100] transition-colors">Comment ça marche</a></li>
                <li><a href="#notre-mission" className="text-white/80 no-underline hover:text-[#FFB100] transition-colors">Notre mission</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FFB100]">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 no-underline hover:text-[#FFB100] transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-white/80 no-underline hover:text-[#FFB100] transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/60">
          <p>© 2024 MyBook. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 