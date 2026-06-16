import { ProductCard } from "./product-card";
import type { Product } from "@/types";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  className?: string;
}

export function RelatedProducts({ 
  products, 
  title = "Related Products",
  className = ""
}: RelatedProductsProps) {
  // Handle empty state
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="compact" />
        ))}
      </div>
    </div>
  );
}