import { z } from "zod";

// Validation schema - This file has NO "use server" directive
export const productFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRating: z.number().min(0).max(5).optional(),
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
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export type ProductFiltersInput = z.infer<typeof productFilterSchema>;

export interface ProductFilters {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: string;
  inStock?: boolean;
  tags?: string[];
  featured?: boolean;
}