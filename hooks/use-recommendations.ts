"use client";

import { useQuery } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: { url: string; altText: string | null; isPrimary: boolean }[];
}

async function fetchRecommendations(productId?: string, limit: number = 4): Promise<Product[]> {
  const url = productId 
    ? `/api/recommendations?productId=${productId}&limit=${limit}`
    : `/api/recommendations?limit=${limit}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch recommendations");
  const data = await response.json();
  return data.products;
}

export function useRecommendations(productId?: string, limit: number = 4) {
  return useQuery({
    queryKey: ["recommendations", productId, limit],
    queryFn: () => fetchRecommendations(productId, limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
}