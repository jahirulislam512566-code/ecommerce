import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "week";
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    
    switch (range) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
    }

    // Parallel queries for dashboard data
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      currentRevenue,
      previousRevenue,
      currentOrdersCount,
      previousOrdersCount,
      recentOrders,
      lowStockProducts,
      recentUsers,
      topProducts,
      categoryBreakdown,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Total users
      prisma.user.count(),
      
      // Total products
      prisma.product.count(),
      
      // Current period revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: startDate },
        },
        _sum: { total: true },
      }),
      
      // Previous period revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: previousStartDate, lt: startDate },
        },
        _sum: { total: true },
      }),
      
      // Current period orders count
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      // Previous period orders count
      prisma.order.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          quantity: { lte: prisma.product.fields.lowStockThreshold },
          status: "ACTIVE",
        },
        take: 10,
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          lowStockThreshold: true,
        },
      }),
      
      // Recent users
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      
      // Top products by sales
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
          total: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 10,
      }),
      
      // Category breakdown
      prisma.category.findMany({
        select: {
          name: true,
          _count: {
            select: { products: true },
          },
        },
      }),
    ]);

    // Calculate revenue change
    const currentRevenueValue = currentRevenue._sum.total?.toNumber() || 0;
    const previousRevenueValue = previousRevenue._sum.total?.toNumber() || 0;
    const revenueChange = previousRevenueValue === 0 
      ? 100 
      : ((currentRevenueValue - previousRevenueValue) / previousRevenueValue) * 100;

    // Calculate orders change
    const ordersChange = previousOrdersCount === 0 
      ? 100 
      : ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100;

    // Get top products details
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true, price: true },
        });
        return {
          id: item.productId,
          name: product?.name || "Unknown",
          sku: product?.sku || "N/A",
          sold: item._sum.quantity || 0,
          revenue: item._sum.total?.toNumber() || 0,
        };
      })
    );

    // Get conversion rate (orders / visitors - you would need to integrate analytics)
    const conversionRate = 3.2; // Placeholder - integrate with your analytics

    // Get daily sales for chart
    const dailySales = await prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startDate },
      },
      _sum: { total: true },
    });

    // Format daily sales
    const salesByDay = dailySales.map((day) => ({
      date: day.createdAt.toISOString().split("T")[0],
      sales: day._sum.total?.toNumber() || 0,
    }));

    // Format category breakdown
    const categoryBreakdownFormatted = categoryBreakdown.map((cat) => ({
      name: cat.name,
      value: cat._count.products,
    }));

    // Calculate total customers with orders
  // const _customersWithOrders = await prisma.order.groupBy({
  //     by: ["userId"],
  //   });

    const stats = {
      totalRevenue: currentRevenueValue,
      totalOrders,
      totalProducts,
      totalUsers,
      revenueChange: Math.round(revenueChange),
      ordersChange: Math.round(ordersChange),
      conversionRate: conversionRate,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || order.user?.email || "Guest",
        total: order.total.toNumber(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      })),
      lowStockProducts,
      recentUsers: recentUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        _count: user._count,
      })),
      topProducts: topProductsWithDetails,
      categoryBreakdown: categoryBreakdownFormatted,
      salesByDay,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}