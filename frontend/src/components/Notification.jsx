import React, { useEffect } from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className={`fixed top-20 right-4 border px-4 py-3 rounded-lg shadow-lg animate-fade-in ${getNotificationStyle()}`}>
      <div className="flex items-center">
        <span className="block sm:inline">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-sm font-bold hover:text-gray-800"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
