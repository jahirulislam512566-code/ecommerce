"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import type { SortOption } from "@/hooks/use-products";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters-client";
import { ProductSkeleton } from "@/components/products/product-skeleton";
import { ProductSearchBar } from "@/components/products/product-search-bar";

interface FiltersType {
  page: number;
  limit: number;
  category: string | undefined;
  search: string | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number | undefined;
  sort: SortOption;
  inStock: boolean | undefined;
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 12,
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
    minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
    sort: (searchParams.get("sort") as SortOption) || "newest",
    inStock: searchParams.get("inStock") === "true" ? true : 
             searchParams.get("inStock") === "false" ? false : undefined,
  });

  // Clean filters for API
  const cleanFilters = {
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
    ...(filters.category && { category: filters.category }),
    ...(filters.search && { search: filters.search }),
    ...(filters.minPrice !== undefined && { minPrice: filters.minPrice }),
    ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
    ...(filters.minRating !== undefined && { minRating: filters.minRating }),
    ...(filters.inStock !== undefined && { inStock: filters.inStock }),
  };

  const { data, isLoading, error, refetch } = useProducts(cleanFilters);

  // Create a clean filter object without undefined for the ProductFilters component
  const filterProps = {
    ...(filters.category && { category: filters.category }),
    ...(filters.minPrice !== undefined && { minPrice: filters.minPrice }),
    ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
    ...(filters.minRating !== undefined && { minRating: filters.minRating }),
    ...(filters.inStock !== undefined && { inStock: filters.inStock }),
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.minRating) params.set("minRating", filters.minRating.toString());
    if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
    if (filters.inStock !== undefined) params.set("inStock", filters.inStock.toString());
    if (filters.page > 1) params.set("page", filters.page.toString());
    
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [
    filters.category,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    filters.sort,
    filters.inStock,
    filters.page,
    router
  ]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: key === "page" ? value : 1 
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: undefined,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      sort: "newest",
      inStock: undefined,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load products</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <ProductSearchBar
          onSearch={(search) => handleFilterChange("search", search || undefined)}
          initialValue={filters.search || ""} 
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Pass the clean filter props */}
        <aside className="lg:w-1/4">
          <ProductFilters
            filters={filterProps}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            categories={data?.filters?.categories || []}
            priceRange={data?.filters?.priceRange || { min: 0, max: 1000 }}
          />
        </aside>

        {/* Product Grid */}
        <main className="lg:w-3/4">
          {isLoading ? (
            <ProductSkeleton />
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {data?.products?.length || 0} of {data?.pagination?.totalCount || 0} products
                </p>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value as SortOption)}
                  className="px-3 py-1 border rounded-lg text-sm bg-white text-gray-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="popularity_desc">Most Popular</option>
                </select>
              </div>

              <ProductGrid
                products={data?.products || []}
                pagination={data?.pagination}
                filters={filters}
                onLoadMore={() => handleFilterChange("page", filters.page + 1)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 h-96 bg-gray-100 rounded animate-pulse" />
          <div className="lg:w-3/4">
            <ProductSkeleton />
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}