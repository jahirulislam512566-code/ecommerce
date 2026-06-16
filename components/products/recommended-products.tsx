"use client";

import { ProductCard } from "./product-card";
import { useRecommendations } from "@/hooks/use-recommendations";

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-80" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !products?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-1">
          {/* Add navigation buttons if needed */}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}