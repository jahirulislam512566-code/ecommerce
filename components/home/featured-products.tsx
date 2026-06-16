import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          variant="featured"
          showQuickView={true}
        />
      ))}
    </div>
  );
}