import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch authenticated user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total.toNumber(),
      createdAt: order.createdAt,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ orders: [] });
  }
}

// POST: Create a new order for authenticated user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Fixed: Enforce authentication boundary since schema requires a non-nullable userId
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to complete an order." },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      shippingAddress,
      billingAddress,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
      shippingMethod,
      paymentMethod,
    } = body;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id, // Fixed: Safely guaranteed to be a valid string now
        status: paymentMethod === "cod" ? "PROCESSING" : "PENDING",
        paymentStatus: "PENDING",
        subtotal: subtotal || 0,
        discount: 0,
        tax: tax || 0,
        shippingCost: shippingCost || 0,
        total: total || 0,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        customerNote: notes || "",
        shippingMethod: shippingMethod || "standard",
        items: {
          create: items.map((item: any) => {
            const itemPrice = Number(item.price);
            const itemQuantity = Number(item.quantity);
            
            return {
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: itemQuantity,
              price: itemPrice,
              total: Math.round(itemPrice * itemQuantity * 100) / 100,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // Clear cart for logged-in users
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total.toNumber(),
      },
      requiresPayment: paymentMethod !== "cod",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}