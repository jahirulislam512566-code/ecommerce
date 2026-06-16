"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, Eye } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number
    images: { url: string; altText?: string; isPrimary: boolean }[]
    quantity: number
    variants?: { id: string; attributes: Record<string, string>; quantity: number }[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  
  const hasVariants = product.variants && product.variants.length > 0
  const isInStock = product.quantity > 0 || (hasVariants && product.variants?.some(v => v.quantity > 0))
  
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{discount}%
        </div>
      )}
      
      {/* Stock Badge */}
      {!isInStock && (
        <div className="absolute top-2 right-2 z-10 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
          Out of Stock
        </div>
      )}
      
      {/* Product Image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Variant Selector (if has variants) */}
        {hasVariants && (
          <div className="mt-3">
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
              onChange={(e) => setSelectedVariant(e.target.value)}
              value={selectedVariant || ""}
            >
              <option value="">Select option</option>
              {product.variants?.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {Object.values(variant.attributes).join(" - ")}
                  {variant.quantity === 0 && " (Out of Stock)"}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            disabled={!isInStock || (hasVariants && !selectedVariant)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
          
          <Link
            href={`/product/${product.slug}`}
            className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}