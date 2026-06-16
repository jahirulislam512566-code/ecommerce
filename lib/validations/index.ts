import { z } from "zod";

// ============ Product Validation ============
export const productFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum([
    "newest",
    "oldest", 
    "price_asc",
    "price_desc",
    "rating_desc",
    "popularity_desc",
    "name_asc",
    "name_desc",
  ]).default("newest"),
  inStock: z.coerce.boolean().optional(),
  tags: z.string().optional().transform(val => val?.split(",").filter(Boolean)),
  featured: z.coerce.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]),
  visibility: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ============ Order Validation ============
export const createOrderSchema = z.object({
  shippingAddress: z.object({
    name: z.string().min(1),
    street: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    name: z.string().min(1),
    street: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }).optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1),
    price: z.number().positive(),
  })),
  couponCode: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});

// ============ User Validation ============
export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============ Review Validation ============
export const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(1).max(1000),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(1).max(1000).optional(),
});

// ============ Address Validation ============
export const addressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]),
  isDefault: z.boolean().default(false),
});

// ============ Coupon Validation ============
export const couponValidationSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  subtotal: z.number().positive(),
});

export const createCouponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["FIXED", "PERCENTAGE"]),
  discountValue: z.number().positive(),
  minimumOrder: z.number().positive().optional(),
  maximumDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().default(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  applicableProducts: z.array(z.string()).default([]),
  applicableCategories: z.array(z.string()).default([]),
  excludedProducts: z.array(z.string()).default([]),
});

// ============ Cart Validation ============
export const addToCartSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(99),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

// ============ Payment Validation ============
export const createPaymentIntentSchema = z.object({
  orderId: z.string(),
});

export const webhookSignatureSchema = z.object({
  signature: z.string(),
});

// ============ Type Inference ============
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;