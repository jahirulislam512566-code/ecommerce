"use client"

import { useInView } from "react-intersection-observer"
import { useEffect } from "react"
import { ProductCard } from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"

interface ProductGridProps {
  products: any[]
  pagination: any
  filters: any
  onLoadMore: () => void
}

export function ProductGrid({ products, pagination, filters, onLoadMore }: ProductGridProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  })

  useEffect(() => {
    if (inView && pagination?.hasMore && !filters.page) {
      onLoadMore()
    }
  }, [inView, pagination?.hasMore, filters.page, onLoadMore])

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More Trigger */}
      {pagination?.hasMore && (
        <div ref={ref} className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* End of Products */}
      {!pagination?.hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">You've seen all {pagination?.totalCount} products!</p>
        </div>
      )}
    </div>
  )
}