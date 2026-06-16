import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get orders from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const newOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedOrders = newOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total.toNumber(),
      customerName: order.user?.name || order.user?.email || "Guest",
      createdAt: order.createdAt,
    }));

    return NextResponse.json({ newOrders: formattedOrders });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return NextResponse.json({ newOrders: [] });
  }
}