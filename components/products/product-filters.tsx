"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, X } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "createdAt_desc",
  })

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Build URL
    const params = new URLSearchParams()
    if (newFilters.category) params.set("category", newFilters.category)
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice)
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice)
    if (newFilters.sort && newFilters.sort !== "createdAt_desc") 
      params.set("sort", newFilters.sort)

    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt_desc",
    })
    router.push("/products")
  }

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice

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

          {/* Sort By */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => updateFilters("sort", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ""}
                  onChange={(e) => updateFilters("category", e.target.value)}
                  className="text-blue-600"
                />
                <span>All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      value={category.slug}
                      checked={filters.category === category.slug}
                      onChange={(e) => updateFilters("category", e.target.value)}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min ($)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={filters.minPrice}
                  onChange={(e) => updateFilters("minPrice", e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max ($)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilters("maxPrice", e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
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