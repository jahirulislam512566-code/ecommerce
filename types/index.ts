import { Prisma, ProductStatus, ProductVisibility, OrderStatus, PaymentStatus, UserRole } from "@prisma/client";

// ============ Utility Types ============
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ApiResponse<T = unknown> = { // Fixed: Changed default from any to unknown for safer strict rules
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// ============ Product Types ============
export type ProductStatusType = `${ProductStatus}`;
export type ProductVisibilityType = `${ProductVisibility}`;

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  order: number;
  productId: string;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string | null;
  attributes: Record<string, string>;
  price: number | null;
  comparePrice: number | null;
  quantity: number;
  image: string | null;
  productId: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  helpful: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface ProductDimensions {
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  sku: string;
  barcode: string | null;
  quantity: number;
  lowStockThreshold: number;
  status: ProductStatusType;
  visibility: ProductVisibilityType;
  featured: boolean;
  tags: string[];
  weight: number | null;
  dimensions: Prisma.JsonValue | ProductDimensions; // Fixed: Combined with structured typing for safe code access
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  vendor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Order & Payment Types ============
export type OrderStatusType = `${OrderStatus}`;
export type PaymentStatusType = `${PaymentStatus}`;

// Fixed: Added missing Payment interface definition requested by the Order array
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  provider: "STRIPE" | "COD" | string;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: ProductImage[];
  };
  variant: ProductVariant | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatusType;
  paymentStatus: PaymentStatusType;
  paymentIntentId: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address | null;
  customerNote: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  items: OrderItem[];
  payments: Payment[]; // Now matches successfully
  createdAt: Date;
  updatedAt: Date;
}

// ============ Cart Types ============
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantName?: string;
  variantAttributes?: Record<string, string>;
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

// ============ User Types ============
export type UserRoleType = `${UserRole}`;

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRoleType;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  type: "SHIPPING" | "BILLING" | "BOTH";
  name: string;
  street: string;
  street2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

// ============ Coupon Types ============
export type DiscountType = "FIXED" | "PERCENTAGE";

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrder: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: DiscountType;
}

// ============ Filter Types ============
export type SortOption = 
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "popularity_desc"
  | "name_asc"
  | "name_desc";

export interface ProductFilters {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: SortOption;
  inStock?: boolean;
  tags?: string[];
  featured?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// ============ Review Types ============
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============ Wishlist Types ============
export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  product: Product;
  createdAt: Date;
}

// ============ API Response Types ============
export interface ProductsResponse extends PaginatedResponse<Product> {
  filters: {
    priceRange: { min: number; max: number };
    categories: { slug: string; count: number }[];
  };
}

export interface OrderResponse {
  order: Order;
}

export interface CheckoutResponse {
  clientSecret: string;
  orderId: string;
}

// ============ Form Types ============
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export interface AddressFormData {
  name: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  type: "SHIPPING" | "BILLING" | "BOTH";
  isDefault: boolean;
}