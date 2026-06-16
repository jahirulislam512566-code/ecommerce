// hooks/use-products.ts
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getFilteredProducts, 
  getProductSuggestions, 
  revalidateProducts,
} from "@/lib/actions/product-actions";

export type SortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "rating_desc" | "popularity_desc" | "name_asc" | "name_desc";

export interface ProductFiltersInput {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortOption;
  inStock?: boolean;
  tags?: string[];
  featured?: boolean;
}

export interface ProductFilters {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: SortOption;
  inStock?: boolean;
  tags?: string[];
  featured?: boolean;
}

// Helper function to clean filters
function cleanProductFilters(filters: ProductFiltersInput): ProductFilters {
  return {
    page: filters.page || 1,
    limit: filters.limit || 12,
    sort: (filters.sort || "newest") as SortOption,
    ...(filters.category && { category: filters.category }),
    ...(filters.search && { search: filters.search }),
    ...(filters.minPrice !== undefined && { minPrice: filters.minPrice }),
    ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
    ...(filters.minRating !== undefined && { minRating: filters.minRating }),
    ...(filters.inStock !== undefined && { inStock: filters.inStock }),
    ...(filters.tags && { tags: filters.tags }),
    ...(filters.featured !== undefined && { featured: filters.featured }),
  };
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
  const cleanFilters = cleanProductFilters(filters);

  return useQuery({
    queryKey: productKeys.list(cleanFilters),
    queryFn: () => getFilteredProducts(cleanFilters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useInfiniteProducts(initialFilters: ProductFiltersInput) {
  const baseFilters = cleanProductFilters(initialFilters);

  return useInfiniteQuery({
    queryKey: productKeys.list(baseFilters),
    queryFn: ({ pageParam = 1 }) =>
      getFilteredProducts({ ...baseFilters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
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
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      console.error("Failed to revalidate products:", error);
    },
  });
}