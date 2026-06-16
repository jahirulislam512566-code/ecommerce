"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingBag, Trash2 } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { QuantitySelector } from "./quantity-selector"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { 
    items, 
    isLoading, 
    getTotalItems, 
    getSubtotal, 
    getTotal,
    updateQuantity, 
    removeItem,
    initialize 
  } = useCartStore()

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  // 1. Add a mounted tracking state
  const [isMounted, setIsMounted] = useState(false)

  // 2. Set mounted to true on the client first render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 3. Keep calculations, but we will conditionally mask them
  const totalItems = isMounted ? getTotalItems() : 0
  const subtotal = isMounted ? getSubtotal() : 0
  const total = isMounted ? getTotal() : 0
  const tax = subtotal * 0.1
  const shipping = subtotal > 50 ? 0 : 5

  useEffect(() => {
    if (isOpen) {
      initialize()
    }
  }, [isOpen, initialize])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Redirect to checkout page
    window.location.href = "/checkout"
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <span className="text-sm text-gray-500">({totalItems})</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added any items yet
              </p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartDrawerItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Order Summary */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Promo Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                Apply
              </button>
            </div>

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {subtotal > 0 && subtotal < 50 && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Shipping and taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// Cart Drawer Item Component
interface CartDrawerItemProps {
  item: {
    id: string
    name: string
    slug: string
    price: number
    quantity: number
    image: string
    variantName?: string
    variantAttributes?: Record<string, string>
    maxStock: number
  }
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>
  onRemove: (id: string) => Promise<void>
  isLoading: boolean
}

function CartDrawerItem({ item, onUpdateQuantity, onRemove, isLoading }: CartDrawerItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    await onRemove(item.id)
    setIsRemoving(false)
  }

  const itemTotal = item.price * item.quantity

  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/product/${item.slug}`}
        className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.slug}`}>
          <h4 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
            {item.name}
          </h4>
        </Link>
        
        {item.variantName && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
        )}
        
        {item.variantAttributes && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(item.variantAttributes).map(([key, value]) => (
              <span
                key={key}
                className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              ${item.price.toFixed(2)}
            </span>
            {item.quantity > 1 && (
              <span className="text-xs text-gray-500">
                × {item.quantity}
              </span>
            )}
          </div>
          <span className="font-semibold text-gray-900">
            ${itemTotal.toFixed(2)}
          </span>
        </div>

        {/* Quantity Controls and Remove */}
        <div className="flex items-center justify-between mt-2">
          <QuantitySelector
            quantity={item.quantity}
            maxStock={item.maxStock}
            onQuantityChange={(quantity) => onUpdateQuantity(item.id, quantity)}
            isLoading={isLoading}
            size="sm"
          />
          
          <button
            onClick={handleRemove}
            disabled={isRemoving || isLoading}
            className="text-red-500 hover:text-red-600 disabled:opacity-50 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}