"use client"

import { useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { ShoppingCart, Check } from "lucide-react"

interface AddToCartButtonProps {
  productId: string
  productName: string
  productSlug: string
  price: number
  image: string
  variantId?: string
  variantName?: string
  variantAttributes?: Record<string, string>
  maxStock: number
  quantity?: number
  className?: string
  onSuccess?: () => void
}

export function AddToCartButton({
  productId,
  productName,
  productSlug,
  price,
  image,
  variantId,
  variantName,
  variantAttributes,
  maxStock,
  quantity = 1,
  className = "",
  onSuccess,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const isLoading = useCartStore((state) => state.isLoading)

  const handleAddToCart = async () => {
    await addItem({
      productId,
      name: productName,
      slug: productSlug,
      price,
      image,
      variantId,
      variantName,
      variantAttributes,
      quantity,
      maxStock,
    })

    // Show success animation
    setIsAdded(true)
    onSuccess?.()
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || maxStock === 0}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      <span className={`inline-flex items-center gap-2 transition-transform duration-300 ${isAdded ? 'scale-110' : ''}`}>
        {isAdded ? (
          <>
            <Check className="w-5 h-5" />
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </>
        )}
      </span>
      
      {/* Ripple effect */}
      {isAdded && (
        <span className="absolute inset-0 bg-white/20 animate-ping rounded-full" />
      )}
    </button>
  )
}