"use client";

import { ProductCard } from "./product-card";
import { useRecommendations } from "@/hooks/use-recommendations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import type { Product } from "@/types";

interface RecommendedProductsProps {
  productId?: string;
  title?: string;
  limit?: number;
}

export function RecommendedProducts({ 
  productId, 
  title = "You May Also Like", 
  limit = 4 
}: RecommendedProductsProps) {
  const { data: products, isLoading, error } = useRecommendations(productId, limit);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = limit || 4;

  // Map the recommendation data to match Product type - use 'as any' for simplicity
  const mappedProducts = useMemo(() => {
    if (!products) return [];
    return products.map((item: any) => ({
      ...item, // Spread all existing properties
      // Ensure required fields have defaults
      comparePrice: item.comparePrice || null,
      images: item.images || [],
      variants: item.variants || [],
      quantity: item.quantity || 0,
      category: item.category || null,
      averageRating: item.averageRating || 0,
      reviewCount: item.reviewCount || 0,
      inStock: item.inStock ?? (item.quantity > 0),
    })) as Product[];
  }, [products]);

  // Handle loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(Math.min(limit, 4))].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-80" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error
  if (error) {
    console.error("Error loading recommendations:", error);
    return null;
  }

  // Handle no products
  if (!mappedProducts || mappedProducts.length === 0) {
    return null;
  }

  // Pagination
  const totalPages = Math.ceil(mappedProducts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, mappedProducts.length);
  const displayedProducts = mappedProducts.slice(startIndex, endIndex);

  const goToNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const canScrollNext = endIndex < mappedProducts.length;
  const canScrollPrevious = currentPage > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              disabled={!canScrollPrevious}
              className={`p-2 rounded-lg border transition-colors ${
                canScrollPrevious 
                  ? "hover:bg-gray-100 text-gray-700" 
                  : "opacity-50 cursor-not-allowed text-gray-400"
              }`}
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              disabled={!canScrollNext}
              className={`p-2 rounded-lg border transition-colors ${
                canScrollNext 
                  ? "hover:bg-gray-100 text-gray-700" 
                  : "opacity-50 cursor-not-allowed text-gray-400"
              }`}
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentPage === index ? "bg-blue-600 w-4" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}