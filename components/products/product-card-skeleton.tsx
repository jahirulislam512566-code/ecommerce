export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content Skeleton */}
      <div className="p-4">
        {/* Category Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
        
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
        
        {/* Price Skeleton */}
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-4" />
        
        {/* Button Skeleton */}
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  )
}