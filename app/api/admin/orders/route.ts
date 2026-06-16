import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = _request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }
    
    // Fixed: Clean structural relation layout for Prisma OR queries
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ]
          }
        }
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { url: true }, // Fixed: Added select to ensure url is returned cleanly
                  },
                },
              },
              variant: true,
            },
          },
          payments: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user?.name || order.user?.email || "Guest",
      customerEmail: order.user?.email,
      total: order.total.toNumber(),
      subtotal: order.subtotal.toNumber(),
      tax: order.tax.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      discount: order.discount.toNumber(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: item.price.toNumber(),
        total: item.total.toNumber(),
        variant: item.variant,
        image: item.product.images[0]?.url || "/placeholder.jpg",
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
    }));

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status, trackingNumber } = await request.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    
    if (status === "SHIPPED") updateData.shippedAt = new Date();
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
    if (status === "CANCELLED") updateData.cancelledAt = new Date();

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}