"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productFilterSchema, type ProductFiltersInput } from "./product-actions.types";

// ✅ Only async functions here
export async function getFilteredProducts(filters: ProductFiltersInput) {
  try {
    const validated = productFilterSchema.parse(filters);
    const { page, limit, category, search, minPrice, maxPrice, minRating, sort, inStock, tags, featured } = validated;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "ACTIVE",
      visibility: "PUBLISHED",
    };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minRating && minRating > 0) {
      where.reviews = {
        some: {
          rating: { gte: minRating },
        },
      };
    }

    if (inStock !== undefined) {
      if (inStock) {
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

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    // Build orderBy
    let orderBy = {};
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating_desc":
        orderBy = { reviews: { _avg: { rating: "desc" } } };
        break;
      case "popularity_desc":
        orderBy = { orderItems: { _count: "desc" } };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch products
    const [products, totalCount, categories, priceRange] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 2,
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
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
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
      prisma.product.aggregate({
        where: {
          status: "ACTIVE",
          visibility: "PUBLISHED",
        },
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
      
      return {
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
        averageRating: avgRating,
        reviewCount: product.reviews.length,
        popularityScore: product._count.orderItems,
        inStock: product.quantity > 0 || product.variants.some(v => v.quantity > 0),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    const hasMore = skip + limit < totalCount;

    return {
      success: true,
      products: productsWithRating,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      filters: {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          _count: { products: cat._count.products },
        })),
        priceRange: {
          min: priceRange._min.price?.toNumber() || 0,
          max: priceRange._max.price?.toNumber() || 1000,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch products",
      products: [],
      pagination: {
        page: 1,
        limit: 12,
        totalCount: 0,
        totalPages: 0,
        hasMore: false,
        nextPage: null,
        prevPage: null,
      },
      filters: {
        categories: [],
        priceRange: { min: 0, max: 1000 },
      },
    };
  }
}

export async function getProductSuggestions(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 2) {
    return { suggestions: [] };
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        visibility: "PUBLISHED",
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { tags: { has: searchTerm } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price.toNumber(),
      images: product.images,
    }));

    return { suggestions: formattedProducts };
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return { suggestions: [] };
  }
}

export async function revalidateProducts() {
  revalidatePath("/products");
  revalidatePath("/");
}