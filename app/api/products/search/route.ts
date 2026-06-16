// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    console.log("=== PRODUCTS GET API CALLED ===");
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') === 'true';
    const inStock = searchParams.get('inStock') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause using precise array grouping to avoid key collisions
    const andConditions: Prisma.ProductWhereInput[] = [
      { status: "ACTIVE" },
      { visibility: "PUBLISHED" }
    ];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ]
      });
    }

    if (categorySlug) {
      andConditions.push({ category: { slug: categorySlug } });
    }

    if (minPrice || maxPrice) {
      const priceCondition: Prisma.DecimalFilter = {};
      if (minPrice) priceCondition.gte = parseFloat(minPrice);
      if (maxPrice) priceCondition.lte = parseFloat(maxPrice);
      andConditions.push({ price: priceCondition });
    }

    if (featured) {
      andConditions.push({ featured: true });
    }

    if (inStock) {
      andConditions.push({ quantity: { gt: 0 } });
    }

    const where: Prisma.ProductWhereInput = { AND: andConditions };

    // Build valid type-safe order conditions
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
      case 'popularity_desc': // Fallback behavior for custom relational counter sort definitions
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          variants: {
            select: {
              id: true,
              attributes: true,
              quantity: true,
              price: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Transform products and inner nested decimals cleanly
    const transformedProducts = products.map(product => ({
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
      // Fixed: Safely convert variant prices from Decimal instances to JavaScript numbers
      variants: product.variants.map(v => ({
        id: v.id,
        attributes: v.attributes as Record<string, string>,
        quantity: v.quantity,
        price: v.price?.toNumber() || null,
      })),
      category: product.category,
      inStock: product.quantity > 0 || product.variants.some(v => v.quantity > 0),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    const hasMore = skip + limit < total;

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}