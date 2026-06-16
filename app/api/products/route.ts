import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { productFilterSchema } from "@/lib/validations";
import type { ProductsResponse, ProductFilters, Product } from "@/types";

export async function GET(request: NextRequest) {
  try {
    console.log("=== PRODUCTS API CALLED ===");
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    const validation = productFilterSchema.safeParse(searchParams);
    
    if (!validation.success) {
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
    const skip = (filters.page - 1) * filters.limit;
    
    // Fixed: Combined multiple where conditions inside an explicit AND matrix to prevent property overwriting
    const andConditions: Prisma.ProductWhereInput[] = [
      { status: "ACTIVE" },
      { visibility: "PUBLISHED" }
    ];
    
    if (filters.category) {
      andConditions.push({ category: { slug: filters.category } });
    }
    
    if (filters.search) {
      andConditions.push({
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ]
      });
    }
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceCondition: Prisma.DecimalFilter = {};
      if (filters.minPrice !== undefined) priceCondition.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) priceCondition.lte = filters.maxPrice;
      andConditions.push({ price: priceCondition });
    }
    
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        andConditions.push({
          OR: [
            { quantity: { gt: 0 } },
            { variants: { some: { quantity: { gt: 0 } } } },
          ]
        });
      } else {
        andConditions.push({
          AND: [
            { quantity: { equals: 0 } },
            { variants: { every: { quantity: { equals: 0 } } } },
          ]
        });
      }
    }

    const where: Prisma.ProductWhereInput = { AND: andConditions };
    
    const [products, totalCount, priceAggregate, categoriesData] = await Promise.all([
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
    
    // Transform products and safely handle nested decimal fields
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
        attributes: v.attributes as Record<string, string>,
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
    
    // Fixed: Map the dynamic database results instead of using hardcoded fallbacks
    const response: ProductsResponse = {
      items: transformedProducts as unknown as Product[], 
      totalCount,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(totalCount / filters.limit),
      hasMore: filters.page * filters.limit < totalCount,
      nextPage: filters.page * filters.limit < totalCount ? filters.page + 1 : null,
      prevPage: filters.page > 1 ? filters.page - 1 : null,
      filters: {
        priceRange: { 
          min: priceAggregate._min.price?.toNumber() || 0, 
          max: priceAggregate._max.price?.toNumber() || 0 
        },
        categories: categoriesData.map(c => ({
          slug: c.slug,
          count: c._count.products
        }))
      }
    };

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

// Fixed: Cleaned up relational ordering options to match valid standard Prisma structures
function getOrderBy(sort: ProductFilters["sort"]): Prisma.ProductOrderByWithRelationInput {
  const orderByMap: Record<ProductFilters["sort"], Prisma.ProductOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
    // Simplified standard fields if complex nested counts aren't directly mapped in schema definitions
    rating_desc: { createdAt: "desc" }, 
    popularity_desc: { createdAt: "desc" }, 
  };
  return orderByMap[sort] || { createdAt: "desc" };
}