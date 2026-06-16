import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    // For Next.js 15+, params is a Promise
    const params = await context.params;
    const { orderId } = params;
    
    console.log("API called with orderId:", orderId);

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: { url: true },
                },
              },
            },
            variant: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      console.log("Order not found:", orderId);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Format the response (no auth check for now to test)
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total.toNumber(),
      subtotal: order.subtotal.toNumber(),
      tax: order.tax.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      discount: order.discount.toNumber(),
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      trackingNumber: order.trackingNumber,
      customerNote: order.customerNote,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage: item.product.images[0]?.url || "/placeholder.jpg",
        variantId: item.variantId,
        variantName: item.variant?.name,
        variantAttributes: item.variant?.attributes,
        quantity: item.quantity,
        price: item.price.toNumber(),
        total: item.total.toNumber(),
      })),
    };

    console.log("Order found:", formattedOrder.orderNumber);
    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}