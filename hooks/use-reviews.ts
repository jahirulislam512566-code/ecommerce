// hooks/use-reviews.ts
"use client";

import { useQuery } from "@tanstack/react-query";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  isVerified: boolean;
  helpful: number;
  user: {
    id: string;
    name: string | null;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

async function fetchReviews(productId: string): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  const response = await fetch(`/api/reviews?productId=${productId}`);
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
}

export function useReviews(productId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    reviews: data?.reviews || [],
    stats: data?.stats || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    isLoading,
    error,
  };
}