import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/20 backdrop-blur-[2px] transition-all duration-300">
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-lg animate-modal-slide-up" 
        style={{ animation: '0.3s ease-out 0s 1 normal none running modal-slide-up' }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal; 