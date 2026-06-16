"use client";

import { useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCoupon } from "@/hooks/use-coupon";

interface CouponInputProps {
  subtotal: number;
  onDiscountChange: (discount: number) => void;
}

export function CouponInput({ subtotal, onDiscountChange }: CouponInputProps) {
  const [code, setCode] = useState("");
  const { appliedCoupon, error, isValidating, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();

  const handleApply = async () => {
    if (!code.trim()) return;
    await applyCoupon(code, subtotal);
    setCode("");
  };

  const handleRemove = () => {
    removeCoupon();
    onDiscountChange(0);
  };

  // Update discount when coupon is applied
  useState(() => {
    if (appliedCoupon) {
      const discount = calculateDiscount(subtotal);
      onDiscountChange(discount);
    }
  });

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-700">Coupon Applied!</p>
            <p className="text-xs text-green-600">
              {appliedCoupon.code} - {appliedCoupon.type === "FIXED" 
                ? `$${appliedCoupon.discount} off` 
                : `${appliedCoupon.discount}% off`}
            </p>
          </div>
        </div>
        <button onClick={handleRemove} className="text-green-600 hover:text-green-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
          Apply
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}