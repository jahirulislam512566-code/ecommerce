"use client";

import { useState } from "react";
import { Star, StarHalf, Calendar, AlertCircle } from "lucide-react";
import { useReviews } from "@/hooks/use-reviews";
import { ReviewForm } from "./review-form";

interface ReviewsSectionProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { reviews, stats, isLoading, error } = useReviews(productId);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600">Failed to load reviews</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 text-blue-600 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
          } else {
            return <Star key={i} className="w-4 h-4 text-gray-300" />;
          }
        })}
      </div>
    );
  };

  // Safe access to stats with fallbacks
  const averageRating = stats?.averageRating ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const ratingDistribution = stats?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 rounded-lg">
        <div className="text-center md:text-left">
          <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center md:justify-start mt-2">
            {renderStars(averageRating)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Based on {totalReviews} reviews</div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12">{count}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Write a Review
        </button>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onClose={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
        
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {(review.user?.name?.[0] || "A").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.user?.name || "Anonymous"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.isVerified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mt-3">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                )}
                {review.helpful > 0 && (
                  <div className="mt-3 text-sm text-gray-500">
                    {review.helpful} people found this helpful
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}