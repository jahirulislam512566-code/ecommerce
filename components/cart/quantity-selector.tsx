"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  quantity: number
  maxStock: number
  onQuantityChange: (quantity: number) => void
  isLoading?: boolean
  size?: "sm" | "md" | "lg"
}

export function QuantitySelector({
  quantity,
  maxStock,
  onQuantityChange,
  isLoading = false,
  size = "md",
}: QuantitySelectorProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity)

  const handleDecrease = () => {
    if (localQuantity > 1 && !isLoading) {
      const newQuantity = localQuantity - 1
      setLocalQuantity(newQuantity)
      onQuantityChange(newQuantity)
    }
  }

  const handleIncrease = () => {
    if (localQuantity < maxStock && !isLoading) {
      const newQuantity = localQuantity + 1
      setLocalQuantity(newQuantity)
      onQuantityChange(newQuantity)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      const newQuantity = Math.min(Math.max(1, value), maxStock)
      setLocalQuantity(newQuantity)
      onQuantityChange(newQuantity)
    }
  }

  const sizeClasses = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
    lg: "w-11 h-11 text-lg",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDecrease}
        disabled={localQuantity <= 1 || isLoading}
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center border rounded-lg 
          hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        <Minus className={iconSizes[size]} />
      </button>

      <input
        type="number"
        value={localQuantity}
        onChange={handleInputChange}
        disabled={isLoading}
        min={1}
        max={maxStock}
        className={`
          ${size === "sm" ? "w-12" : size === "md" ? "w-16" : "w-20"}
          text-center border rounded-lg px-2 py-1
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
      />

      <button
        onClick={handleIncrease}
        disabled={localQuantity >= maxStock || isLoading}
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center border rounded-lg 
          hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        <Plus className={iconSizes[size]} />
      </button>
    </div>
  )
}