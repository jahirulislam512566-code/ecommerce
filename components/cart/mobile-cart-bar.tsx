"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { CartDrawer } from "./cart-drawer"

export function MobileCartBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { getTotalItems, getSubtotal } = useCartStore()
  const totalItems = getTotalItems()
  const subtotal = getSubtotal()

  if (totalItems === 0) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{totalItems} items</p>
            <p className="text-lg font-bold">${subtotal.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            View Cart
          </button>
        </div>
      </div>

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}