import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { productFilterSchema } from "@/lib/validations";
import type { ProductsResponse, ProductFilters } from "@/types";

export async function GET(request: NextRequest) {
  try {
    console.log("=== PRODUCTS API CALLED ===");
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    console.log("Search params:", searchParams);
    
    const validation = productFilterSchema.safeParse(searchParams);
    
    if (!validation.success) {
      console.log("Validation failed:", validation.error.issues);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid query parameters",
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }
    
    const filters = validation.data as ProductFilters;
    console.log("Filters:", filters);
    
    const skip = (filters.page - 1) * filters.limit;
    
    // Build where clause using Prisma generated types
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      visibility: "PUBLISHED",
    };
    
    if (filters.category) {
      where.category = { slug: filters.category };
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }
    
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        where.OR = [
          { quantity: { gt: 0 } },
          { variants: { some: { quantity: { gt: 0 } } } },
        ];
      } else {
        where.AND = [
          { quantity: { equals: 0 } },
          { variants: { every: { quantity: { equals: 0 } } } },
        ];
      }
    }
    
    console.log("Where clause:", JSON.stringify(where, null, 2));
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log("Database connected");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }
    
    // Get products with Prisma types
    const [products, totalCount, priceRange, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: getOrderBy(filters.sort),
        include: {
          images: { 
            where: { isPrimary: true }, 
            take: 1 
          },
          variants: {
            select: {
              id: true,
              attributes: true,
              quantity: true,
              price: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.aggregate({
        where: {
          status: "ACTIVE",
          visibility: "PUBLISHED",
        },
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.category.findMany({
        where: {
          products: {
            some: {
              status: "ACTIVE",
              visibility: "PUBLISHED",
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: {
                  status: "ACTIVE",
                  visibility: "PUBLISHED",
                },
              },
            },
          },
        },
      }),
    ]);
    
    console.log(`Found ${products.length} products out of ${totalCount} total`);
    
    // Transform products
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      sku: product.sku,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      status: product.status,
      visibility: product.visibility,
      featured: product.featured,
      tags: product.tags,
      images: product.images,
      variants: product.variants.map(v => ({
        id: v.id,
        attributes: v.attributes,
        quantity: v.quantity,
        price: v.price?.toNumber() || null,
      })),
      category: product.category,
      averageRating: 0,
      reviewCount: 0,
      inStock: product.quantity > 0 || (product.variants?.some(v => v.quantity > 0) ?? false),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
    
    const hasMore = skip + filters.limit < totalCount;
    
    const response: ProductsResponse = {
      items: transformedProducts,
      totalCount,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(totalCount / filters.limit),
      hasMore,
      nextPage: hasMore ? filters.page + 1 : null,
      prevPage: filters.page > 1 ? filters.page - 1 : null,
      filters: {
        priceRange: {
          min: priceRange._min.price?.toNumber() || 0,
          max: priceRange._max.price?.toNumber() || 1000,
        },
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat._count.products,
        })),
      },
    };
    
    console.log("API response successful");
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

function getOrderBy(sort: ProductFilters["sort"]) {
  const orderByMap: Record<ProductFilters["sort"], any> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    rating_desc: { reviews: { _avg: { rating: "desc" } } },
    popularity_desc: { orderItems: { _count: "desc" } },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
  };
  return orderByMap[sort] || { createdAt: "desc" };
}