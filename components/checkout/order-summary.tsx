"use client"

import { useState } from "react"
import { ShieldCheck, Tag, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

interface OrderSummaryProps {
  total: number // Subtotal from the cart store
  shipping?: number
  taxRate?: number
  /**
   * Optional callback if you handle the API submit externally 
   * (e.g. inside a central checkout form provider). 
   * If omitted, it will execute its own internal secure API loop.
   */
  onSubmitOrder?: () => Promise<void>
}

export function OrderSummary({ 
  total, 
  shipping = 0, 
  taxRate = 0.08,
  onSubmitOrder 
}: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState("")
  const [isPromoOpen, setIsPromoOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Calculate financial breakdowns safely
  const subtotal = total ?? 0
  const calculatedTax = subtotal * taxRate
  const grandTotal = Math.max(0, subtotal + shipping + calculatedTax - discount)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const cleanCode = promoCode.trim().toUpperCase()

    if (!cleanCode) return
    
    // Replace this mock logic with an actual API route if available
    if (cleanCode === "WELCOME10") {
      setDiscount(10)
    } else {
      setErrorMessage("Invalid or expired promotional code.")
    }
  }

  const handlePlaceOrder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Stop standard tracking updates or bubbling
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (onSubmitOrder) {
        // If the parent component (like a multi-step form) handles validation, run it
        await onSubmitOrder()
      } else {
        // Otherwise, run a direct secure checkout route dispatch
        const response = await fetch("/api/checkout/place-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subtotal,
            shipping,
            tax: calculatedTax,
            discount,
            total: grandTotal,
            promoCode: discount > 0 ? promoCode : null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Something went wrong during checkout.")
        }

        // If your server hands off a payment url or order id, handle redirect here:
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch (err: any) {
      console.error("Order processing error:", err)
      setErrorMessage(err.message || "Failed to process your payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Order Summary</h2>

      {/* Global Runtime Error Alerts */}
      {errorMessage && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-700 px-3.5 py-3 rounded-xl text-xs font-medium border border-red-100 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pricing Breakdown Rows */}
      <div className="space-y-3 border-b border-gray-100 pb-5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? (
              <span className="text-emerald-600 font-medium">Free Shipping</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Estimated Tax</span>
          <span className="font-medium text-gray-900">${calculatedTax.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600 bg-emerald-50/60 px-2.5 py-1.5 rounded-lg font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Promo Code Applied
            </span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Collapsible Promo Code Module */}
      <div className="border-b border-gray-100 py-4">
        <button
          type="button"
          onClick={() => setIsPromoOpen(!isPromoOpen)}
          className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <span className="flex items-center gap-2">
            <Tag className="w-4 h-4" /> Have a promo code?
          </span>
          {isPromoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isPromoOpen && (
          <form onSubmit={handleApplyPromo} className="flex gap-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <input
              type="text"
              placeholder="e.g. WELCOME10"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase placeholder:normal-case"
            />
            <button
              type="submit"
              disabled={!promoCode.trim()}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Grand Total Footer */}
      <div className="flex justify-between items-baseline pt-5 mb-5">
        <span className="text-base font-medium text-gray-900">Total</span>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">${grandTotal.toFixed(2)}</span>
          <p className="text-[11px] text-gray-400 mt-0.5">Includes local taxes & delivery duties</p>
        </div>
      </div>

      {/* Main Execution Trigger */}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={isSubmitting || subtotal === 0}
        className="w-full relative flex items-center justify-center bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99] transition-all text-center shadow-sm"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Processing Payment...</span>
          </div>
        ) : (
          <span>Place Order</span>
        )}
      </button>

      {/* Security Compliance Badge */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Secure 256-bit encrypted checkout</span>
      </div>
    </div>
  )
}