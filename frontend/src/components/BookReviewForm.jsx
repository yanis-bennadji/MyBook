import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const BookReviewForm = ({ book, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        bookId: book.id,
        userId: user.id,
        rating,
        comment
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4">Ajouter une critique</h2>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <img 
            src={book.thumbnail} 
            alt={book.title} 
            className="w-16 h-24 object-cover rounded"
          />
          <div>
            <h3 className="font-semibold text-lg">{book.title}</h3>
            <p className="text-gray-600 text-sm">{book.authors?.join(', ')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label 
            htmlFor="comment" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Commentaire
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FFB100] focus:border-[#FFB100] focus:ring-2"
            placeholder="Partagez votre avis sur ce livre..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={onCancel}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="bg-[#0F3D3E] text-white"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookReviewForm; 