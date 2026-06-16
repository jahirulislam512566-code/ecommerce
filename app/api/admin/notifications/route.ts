import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const lastChecked = searchParams.get("lastChecked");
    
    // Get orders created after lastChecked
    const where: any = {
      createdAt: {
        gte: lastChecked ? new Date(lastChecked) : new Date(Date.now() - 5 * 60 * 1000),
      },
    };
    
    const newOrders = await prisma.order.findMany({
      where,
      take: 20,
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
      status: order.status,
    }));
    
    return NextResponse.json({ newOrders: formattedOrders });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ newOrders: [] });
  }
}