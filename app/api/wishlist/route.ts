import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Session missing or expired" }, { status: 401 });
    }

    // Query through the User relation mapping
    const userProfile = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        wishlist: {
          select: {
            id: true,
            productId: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,        // Prisma Decimal type
                comparePrice: true, // Prisma Decimal type
                quantity: true,
                images: {
                  select: {
                    url: true,
                    altText: true,
                    isPrimary: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User account not resolved" }, { status: 404 });
    }

    // Format fields correctly so Decimal formats serialize to plain numbers/strings safely
    const formattedItems = userProfile.wishlist.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt.toISOString(),
      product: {
        ...item.product,
        price: item.product.price ? item.product.price.toString() : "0.00",
        comparePrice: item.product.comparePrice ? item.product.comparePrice.toString() : null,
      },
    }));

    return NextResponse.json({ items: formattedItems }, { status: 200 });

  } catch (error: any) {
    console.error("WISHLIST_ROUTE_CRASH:", error);
    return NextResponse.json(
      { error: "Database transaction failed", details: error.message },
      { status: 500 }
    );
  }
}