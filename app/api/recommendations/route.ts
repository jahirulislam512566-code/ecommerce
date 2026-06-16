import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "4");

    let products;

    if (productId) {
      // Get current product's category and tags for recommendations
      const currentProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true, tags: true },
      });

      if (currentProduct) {
        // Find products in same category or with similar tags
        products = await prisma.product.findMany({
          where: {
            id: { not: productId },
            status: "ACTIVE",
            visibility: "PUBLISHED",
            OR: [
              { categoryId: currentProduct.categoryId },
              { tags: { hasSome: currentProduct.tags } },
            ],
          },
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
          orderBy: [
            { orderItems: { _count: "desc" } }, // Popularity
            { createdAt: "desc" },
          ],
          take: limit,
        });
      } else {
        // Fallback: get popular products
        products = await getPopularProducts(limit);
      }
    } else {
      // No product context - show popular products
      products = await getPopularProducts(limit);
    }

    const formattedProducts = products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getPopularProducts(limit: number) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      visibility: "PUBLISHED",
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: {
      orderItems: {
        _count: "desc",
      },
    },
    take: limit,
  });
}