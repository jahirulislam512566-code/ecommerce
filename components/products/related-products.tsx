import { ProductCard } from "./product-card";
import type { Product } from "@/types";

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant="compact" />
      ))}
    </div>
  );
}