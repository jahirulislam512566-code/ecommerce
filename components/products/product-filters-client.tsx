"use client"

import { useState } from "react"
import { Filter, X, Star } from "lucide-react"

// Update this interface to make all properties optional
interface ProductFiltersType {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
}

interface ProductFiltersClientProps {
  filters: ProductFiltersType; // Use the flexible type
  onFilterChange: (key: string, value: any) => void
  onClearFilters: () => void
  categories: Array<{
    id: string
    name: string
    slug: string
    _count: { products: number }
  }>
  priceRange: { min: number; max: number }
}

export function ProductFilters({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  priceRange,
}: ProductFiltersClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.minPrice || priceRange.min,
    max: filters.maxPrice || priceRange.max,
  })

  const hasActiveFilters = 
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.inStock !== undefined

  const handlePriceApply = () => {
    onFilterChange("minPrice", localPriceRange.min)
    onFilterChange("maxPrice", localPriceRange.max)
  }

  const handleRatingClick = (rating: number) => {
    onFilterChange("minRating", filters.minRating === rating ? undefined : rating)
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-white border rounded-lg py-2 px-4"
        >
          <Filter className="w-4 h-4" />
          Filter Products
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div
        className={`
          fixed inset-0 z-50 lg:relative lg:inset-auto lg:block
          ${isMobileOpen ? "block" : "hidden lg:block"}
        `}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Filter Content */}
        <div className="fixed bottom-0 left-0 right-0 top-0 w-80 bg-white p-6 overflow-y-auto lg:relative lg:w-auto lg:p-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button onClick={() => setIsMobileOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6 overflow-hidden">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={!filters.category}
                  onChange={() => onFilterChange("category", undefined)}
                  className="text-blue-600"
                />
                <span>All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === category.slug}
                      onChange={() => onFilterChange("category", category.slug)}
                      className="text-blue-600"
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">({category._count.products})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Min ($)</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={localPriceRange.min}
                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || priceRange.min }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Max ($)</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={localPriceRange.max}
                    onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || priceRange.max }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={handlePriceApply}
                className="w-full bg-blue-600 text-white py-1 rounded-lg text-sm hover:bg-blue-700"
              >
                Apply Price
              </button>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localPriceRange.max}
                onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Customer Rating</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === undefined}
                  onChange={() => onFilterChange("minRating", undefined)}
                  className="text-blue-600"
                />
                <span>All Ratings</span>
              </label>
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleRatingClick(rating)}
                    className="text-blue-600"
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
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Availability</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock === true}
                onChange={(e) => onFilterChange("inStock", e.target.checked ? true : undefined)}
                className="text-blue-600"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Actions */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </>
  )
}