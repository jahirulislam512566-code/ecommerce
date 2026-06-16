"use client"

import { useState, useEffect, useRef } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useProductSuggestions } from "@/hooks/use-products"
import { Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProductSearchBarProps {
  onSearch: (search: string) => void
  initialValue?: string
}

export function ProductSearchBar({ onSearch, initialValue = "" }: ProductSearchBarProps) {
  // Remove router since it's not being used
  const [query, setQuery] = useState(initialValue)
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useProductSuggestions(debouncedQuery)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
    setIsOpen(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products by name, category, or tags..."
          className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : data?.suggestions && data.suggestions.length > 0 ? (
            <div>
              <div className="p-2 text-xs text-gray-500 border-b">Suggestions</div>
              {data.suggestions.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                >
                  {product.images && product.images[0] && (
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-blue-600">${product.price?.toFixed(2) || '0.00'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : debouncedQuery.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No products found for "{debouncedQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}