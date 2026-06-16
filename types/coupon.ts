export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number;
  minimumOrder: number | null;
  maximumDiscount: number | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: "FIXED" | "PERCENTAGE";
}