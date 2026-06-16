"use client"

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { CartDrawer } from "./cart-drawer"

export function CartIcon() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { getTotalItems, initialize } = useCartStore()
  const totalItems = getTotalItems()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}