"use client";

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getFilteredProducts, 
  getProductSuggestions, 
  revalidateProducts, 
  type ProductFiltersInput 
} from "@/lib/actions/product-actions";

// Define the filters type for the query key
export interface ProductFilters {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: string;
  inStock?: boolean;
  tags?: string[];
  featured?: boolean;
}

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  suggestions: (search: string) => [...productKeys.all, "suggestions", search] as const,
};

export function useProducts(filters: ProductFiltersInput) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getFilteredProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useInfiniteProducts(initialFilters: ProductFiltersInput) {
  return useInfiniteQuery({
    queryKey: productKeys.list(initialFilters),
    queryFn: ({ pageParam = 1 }) =>
      getFilteredProducts({ ...initialFilters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Check if there's a next page
      if (lastPage?.pagination?.hasMore && lastPage?.pagination?.nextPage) {
        return lastPage.pagination.nextPage;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useProductSuggestions(searchTerm: string) {
  return useQuery({
    queryKey: productKeys.suggestions(searchTerm),
    queryFn: () => getProductSuggestions(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    retry: false,
  });
}

export function useRevalidateProducts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await revalidateProducts();
    },
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      console.error("Failed to revalidate products:", error);
    },
  });
}