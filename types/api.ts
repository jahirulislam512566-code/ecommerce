// types/api.ts

// Common API response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
};

export type PaginatedResponse<T = any> = {
  success: boolean;
  data: {
    items: T[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type ApiError = {
  success: false;
  error: string;
  status?: number;
};

// Params types for dynamic routes
export type ParamsWithId = {
  params: Promise<{ id: string }> | { id: string };
};

export type ParamsWithSlug = {
  params: Promise<{ slug: string }> | { slug: string };
};

export type ParamsWithCategory = {
  params: Promise<{ category: string }> | { category: string };
};

export type ParamsWithProductId = {
  params: Promise<{ productId: string }> | { productId: string };
};

export type ParamsWithOrderId = {
  params: Promise<{ orderId: string }> | { orderId: string };
};

// Combined params for nested routes
export type ParamsWithIdAndSlug = {
  params: Promise<{ id: string; slug: string }> | { id: string; slug: string };
};

// Query params types
export type PaginationQuery = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

export type SearchQuery = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
};

// API handler type
export type ApiHandlerContext = {
  params?: Record<string, string>;
  searchParams?: URLSearchParams;
};

// API route types
export type ApiRoute = {
  GET?: (req: Request, context: ApiHandlerContext) => Promise<Response>;
  POST?: (req: Request, context: ApiHandlerContext) => Promise<Response>;
  PUT?: (req: Request, context: ApiHandlerContext) => Promise<Response>;
  PATCH?: (req: Request, context: ApiHandlerContext) => Promise<Response>;
  DELETE?: (req: Request, context: ApiHandlerContext) => Promise<Response>;
};