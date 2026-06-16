import { ProductCardSkeleton } from "./product-card-skeleton"

export function ProductSkeleton() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="mb-6 flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}