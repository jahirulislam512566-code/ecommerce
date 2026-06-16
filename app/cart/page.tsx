"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import Link from "next/link"
import { ShoppingBag, Trash2, AlertTriangle } from "lucide-react"
import { CartItem } from "@/components/cart/cart-item"

export default function CartPage() {
  const { 
    items, 
    isLoading, 
    getTotalItems, 
    getSubtotal, 
    getTotal,
    clearCart,
    initialize 
  } = useCartStore()

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const totalItems = getTotalItems()
  const subtotal = getSubtotal()
  const total = getTotal()
  const tax = subtotal * 0.1
  const shipping = subtotal > 50 ? 0 : 5

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleClearCart = async () => {
    setIsClearing(true)
    await clearCart()
    setIsClearing(false)
    setShowClearConfirm(false)
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2" />
            <div className="h-3 bg-gray-200 rounded w-48 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items yet</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Clear Cart</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isClearing ? "Clearing..." : "Clear Cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        
        {items.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={isLoading}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b font-medium text-gray-600">
              <div className="md:col-span-5">Product</div>
              <div className="md:col-span-2 text-center">Price</div>
              <div className="md:col-span-3 text-center">Quantity</div>
              <div className="md:col-span-2 text-center">Total</div>
            </div>

            <div className="divide-y">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-2"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              
              {subtotal > 0 && subtotal < 50 && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded mt-2">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Proceed to Checkout
            </button>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Secure checkout powered by Stripe</p>
              <p className="mt-1">Free shipping on orders over $50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}