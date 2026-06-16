"use client"

import { useCartStore } from "@/stores/cartStore"
import Link from "next/link"

export function CartSummary() {
  const { getTotalItems, getSubtotal } = useCartStore()
  const totalItems = getTotalItems()
  const subtotal = getSubtotal()

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40 md:hidden">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{totalItems} items</p>
          <p className="text-lg font-bold">${subtotal.toFixed(2)}</p>
        </div>
        <Link
          href="/cart"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          View Cart
        </Link>
      </div>
    </div>
  )
}