"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { QuantitySelector } from "./quantity-selector"
import { useCartStore } from "@/stores/cartStore"
import { CartItem as CartItemType } from "@/types/cart"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const isLoading = useCartStore((state) => state.isLoading)

  const itemTotal = item.price * item.quantity

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${item.slug}`}
          className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
        >
          {item.name}
        </Link>
        
        {item.variantName && (
          <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>
        )}
        
        {item.variantAttributes && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(item.variantAttributes).map(([key, value]) => (
              <span
                key={key}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
          {/* Price */}
          <div className="text-gray-900 font-semibold">
            ${item.price.toFixed(2)}
          </div>

          {/* Quantity Selector */}
          <QuantitySelector
            quantity={item.quantity}
            maxStock={item.maxStock}
            onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
            isLoading={isLoading}
            size="sm"
          />

          {/* Item Total */}
          <div className="text-gray-900 font-semibold min-w-[80px] text-right">
            ${itemTotal.toFixed(2)}
          </div>

          {/* Remove Button */}
          <button
            onClick={() => removeItem(item.id)}
            disabled={isLoading}
            className="text-red-500 hover:text-red-600 disabled:opacity-50 p-1"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}