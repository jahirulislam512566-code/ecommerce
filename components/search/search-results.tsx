import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";

export function SearchResults({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <div>No products found</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant="compact" />
      ))}
    </div>
  );
}