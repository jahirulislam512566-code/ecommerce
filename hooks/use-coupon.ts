"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppliedCoupon } from "@/types/coupon";

async function validateCoupon(code: string, subtotal: number): Promise<AppliedCoupon> {
  const response = await fetch("/api/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Invalid coupon");
  }
  
  return response.json();
}

export function useCoupon() {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateMutation = useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      validateCoupon(code, subtotal),
    onSuccess: (data) => {
      setAppliedCoupon(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setAppliedCoupon(null);
    },
  });

  const applyCoupon = async (code: string, subtotal: number) => {
    setIsValidating(true);
    setError(null);
    await validateMutation.mutateAsync({ code, subtotal });
    setIsValidating(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setError(null);
  };

  const calculateDiscount = (subtotal: number): number => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === "FIXED") {
      return Math.min(appliedCoupon.discount, subtotal);
    } else {
      return (subtotal * appliedCoupon.discount) / 100;
    }
  };

  return {
    appliedCoupon,
    error,
    isValidating,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };
}