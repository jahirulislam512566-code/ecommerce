import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Get productId from query string (?productId=...)
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // 2. If no session, the item is definitely not in the wishlist
    if (!session?.user?.email) {
      return NextResponse.json({ isWishlisted: false }, { status: 200 });
    }

    // 3. Check if the specific product exists in the user's wishlist
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        user: { email: session.user.email },
        productId: productId,
      },
    });

    return NextResponse.json({ isWishlisted: !!wishlistItem }, { status: 200 });

  } catch (error) {
    console.error("WISHLIST_CHECK_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}