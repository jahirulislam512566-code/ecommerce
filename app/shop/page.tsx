"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Filter, 
  Grid3x3, 
  List, 
  X,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import type { Product } from "@/types"; // Import from your global types file

// 1. Updated for exactOptionalPropertyTypes compliance
interface Filters {
  page: number;
  limit: number;
  category: string | undefined;
  search: string | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number | undefined;
  sort: string;
  inStock: boolean | undefined;
}

// Remove duplicate Product interface - use imported type

interface ProductsResponse {
  success: boolean;
  data: {
    items: Product[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    filters: {
      priceRange: { min: number; max: number };
      categories: { slug: string; name: string; count: number }[];
    };
  };
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "popularity_desc", label: "Most Popular" },
];

const priceRanges = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: undefined },
];

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [, setPriceRange] = useState({ min: 0, max: 1000 });
  const [categories, setCategories] = useState<{ slug: string; name: string; count: number }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 2. Local search tracking to prevent focus dropping issues on input changes
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const [filters, setFilters] = useState<Filters>({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: 12,
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
    minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
    sort: searchParams.get("sort") || "newest",
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
  });

  // Debounce search query changes with proper cleanup
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 400);

    // Cleanup function to clear timeout on unmount or dependency change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  // 3. Fixed: Fetch updates only on individual primitive property alterations
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", filters.page.toString());
      params.set("limit", filters.limit.toString());
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
      if (filters.minRating !== undefined) params.set("minRating", filters.minRating.toString());
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.inStock !== undefined) params.set("inStock", filters.inStock.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data: ProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.data.items);
        setTotalCount(data.data.totalCount);
        setTotalPages(data.data.totalPages);
        setPriceRange(data.data.filters.priceRange);
        setCategories(data.data.filters.categories);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.page, 
    filters.limit, 
    filters.category, 
    filters.search, 
    filters.minPrice, 
    filters.maxPrice, 
    filters.minRating, 
    filters.sort, 
    filters.inStock
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 4. Fixed: Prevent looping state mutations on URL route sync
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.page > 1) params.set("page", filters.page.toString());
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.minRating !== undefined) params.set("minRating", filters.minRating.toString());
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (filters.inStock !== undefined) params.set("inStock", filters.inStock.toString());
    
    const queryString = params.toString();
    const newUrl = `/shop${queryString ? `?${queryString}` : ""}`;
    
    // Only update if the URL actually changed
    const currentUrl = window.location.pathname + window.location.search;
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [
    filters.page, 
    filters.category, 
    filters.search, 
    filters.minPrice, 
    filters.maxPrice, 
    filters.minRating, 
    filters.sort, 
    filters.inStock, 
    router
  ]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // 5. Fixed: Stronger typing for handleFilterChange
  const handleFilterChange = <K extends keyof Filters>(
    key: K, 
    value: Filters[K]
  ) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: key === "page" ? (value as number) : 1 
    }));
  };

  const clearFilters = () => {
    setSearchInput("");
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

  const hasActiveFilters = () => {
    return !!(
      filters.category ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.minRating !== undefined ||
      filters.inStock !== undefined ||
      filters.search
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.minRating !== undefined) count++;
    if (filters.inStock !== undefined) count++;
    if (filters.search) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Shop Collection</h1>
          <p className="text-blue-100">
            Discover our curated collection of high-quality products
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border rounded-lg py-2 px-4 shadow-sm font-medium"
            >
              <Filter className="w-5 h-5" />
              Filter Products
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>

          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={!filters.category}
                        onChange={() => handleFilterChange("category", undefined)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All Categories</span>
                    </div>
                    <span className="text-xs text-gray-500">{totalCount}</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.slug} className="flex items-center justify-between cursor-pointer py-0.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === cat.slug}
                          onChange={() => handleFilterChange("category", cat.slug)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <label key={index} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={
                          filters.minPrice === range.min && filters.maxPrice === range.max
                        }
                        onChange={() => {
                          handleFilterChange("minPrice", range.min);
                          handleFilterChange("maxPrice", range.max);
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice !== undefined ? filters.minPrice : ""}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-2 py-1 border rounded text-sm bg-white text-gray-900"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice !== undefined ? filters.maxPrice : ""}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-2 py-1 border rounded text-sm bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.minRating === undefined}
                      onChange={() => handleFilterChange("minRating", undefined)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">All Ratings</span>
                  </label>
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === rating}
                        onChange={() => handleFilterChange("minRating", rating)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-2">
                <label className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={filters.inStock === true}
                    onChange={(e) => handleFilterChange("inStock", e.target.checked ? true : undefined)}
                    className="text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Drawer Context */}
          {isFilterOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsFilterOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 overflow-y-auto transform transition-transform border-r">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900"
                    />
                  </div>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input
                          type="radio"
                          name="mobile-category"
                          checked={!filters.category}
                          onChange={() => handleFilterChange("category", undefined)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">All Categories</span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat.slug} className="flex items-center gap-2 cursor-pointer py-0.5">
                          <input
                            type="radio"
                            name="mobile-category"
                            checked={filters.category === cat.slug}
                            onChange={() => handleFilterChange("category", cat.slug)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                          <span className="text-xs text-gray-500">({cat.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t mt-auto">
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsFilterOpen(false);
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Products Section */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap justify-between items-center gap-4 border border-gray-100">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{products.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{totalCount}</span> products
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters ({getActiveFiltersCount()})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex gap-1 border rounded-lg p-1 bg-gray-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid / Output */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      // Remove viewMode prop if ProductCard doesn't accept it
                      // If it does accept it, uncomment the line below
                      // viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handleFilterChange("page", filters.page - 1)}
                      disabled={filters.page === 1}
                      className="px-3 py-2 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (filters.page <= 3) {
                          pageNum = i + 1;
                        } else if (filters.page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = filters.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange("page", pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              filters.page === pageNum
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handleFilterChange("page", filters.page + 1)}
                      disabled={filters.page === totalPages}
                      className="px-3 py-2 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// 6. Main Component Export utilizing proper React Suspense Wrapper
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-8" />
        <div className="flex gap-8">
          <div className="hidden lg:block w-80 h-96 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}