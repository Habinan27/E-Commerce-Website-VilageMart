'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewModalProps {
  orderItemId: string;
  productName: string;
  onClose: () => void;
}

export function ReviewModal({ orderItemId, productName, onClose }: ReviewModalProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItemId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Verified Review</span>
          <h3 className="text-lg font-bold text-gray-900 mt-1">Review {productName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Share your experience with other rural marketplace shoppers.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">Thank you for your review!</h4>
            <p className="text-xs text-emerald-700">Your feedback helps local village artisans grow.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 focus:outline-none transition hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 fill-gray-100'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-700 ml-2">
                  {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Very Good (4/5)' : `${rating}/5`}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Review (Tamil, English, or Sinhala)
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe product quality, aroma, packaging, and freshness..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:bg-white focus:border-brand-500 outline-none"
              ></textarea>
            </div>

            <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
              Submit Verified Review
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
