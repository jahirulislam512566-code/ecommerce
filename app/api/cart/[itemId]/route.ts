import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// import { ParamsWithId } from "@/types/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> | { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Await params if it's a Promise
    const resolvedParams = await params;
    const { itemId } = resolvedParams;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { quantity } = await request.json();

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        OR: [
          { productId: itemId },
          { id: itemId },
        ],
      },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest, // Fixed: Added underscore to bypass the unused local compilation block
  { params }: { params: Promise<{ itemId: string }> | { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Await params if it's a Promise
    const resolvedParams = await params;
    const { itemId } = resolvedParams;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        OR: [
          { productId: itemId },
          { id: itemId },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}