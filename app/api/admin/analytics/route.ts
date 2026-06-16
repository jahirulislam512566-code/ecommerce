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
    const range = searchParams.get("range") || "month";
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get basic counts
    const [totalUsers, totalProducts, paidOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          total: true,
          createdAt: true,
          userId: true,
          orderNumber: true,
          status: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              quantity: true,
              total: true,
              product: {
                select: {
                  name: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Calculate revenue
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total.toNumber(), 0);
    
    // Calculate orders count
    const totalOrdersCount = paidOrders.length;
    
    // Get unique customers
    const uniqueCustomers = new Set(paidOrders.map(o => o.userId)).size;
    
    // Get top products
    const productSales = new Map();
    for (const order of paidOrders) {
      for (const item of order.items) {
        const productId = item.product.name;
        const current = productSales.get(productId) || { sold: 0, revenue: 0 };
        productSales.set(productId, {
          id: productId,
          name: item.product.name,
          sold: current.sold + item.quantity,
          revenue: current.revenue + item.total.toNumber(),
        });
      }
    }
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Get sales by day
    const salesByDayMap = new Map();
    for (const order of paidOrders) {
      const date = order.createdAt.toISOString().split('T')[0];
      const current = salesByDayMap.get(date) || 0;
      salesByDayMap.set(date, current + order.total.toNumber());
    }
    
    const salesByDay = Array.from(salesByDayMap.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Get category breakdown
    const categorySales = new Map();
    for (const order of paidOrders) {
      for (const item of order.items) {
        const categoryName = item.product.category?.name || "Uncategorized";
        const current = categorySales.get(categoryName) || 0;
        categorySales.set(categoryName, current + item.total.toNumber());
      }
    }
    
    const totalCategoryRevenue = Array.from(categorySales.values()).reduce((a, b) => a + b, 0);
    const categoryBreakdown = Array.from(categorySales.entries())
      .map(([name, revenue]) => ({
        name,
        value: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
    
    // Calculate previous period for changes
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    
    switch (range) {
      case "week":
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case "month":
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        break;
      case "quarter":
        previousStartDate.setMonth(previousStartDate.getMonth() - 3);
        break;
      case "year":
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        break;
    }
    
    const previousOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: previousStartDate, lt: previousEndDate },
      },
      select: {
        total: true,
        userId: true,
      },
    });
    
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total.toNumber(), 0);
    const previousOrdersCount = previousOrders.length;
    const previousCustomers = new Set(previousOrders.map(o => o.userId)).size;
    
    const revenueChange = previousRevenue === 0 ? 0 : ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    const ordersChange = previousOrdersCount === 0 ? 0 : ((totalOrdersCount - previousOrdersCount) / previousOrdersCount) * 100;
    const customersChange = previousCustomers === 0 ? 0 : ((uniqueCustomers - previousCustomers) / previousCustomers) * 100;
    
    // Estimate conversion rate (placeholder)
    const conversionRate = totalOrdersCount > 0 ? 3.2 : 0;
    
    const analyticsData = {
      users: { total: totalUsers },
      products: { total: totalProducts },
      revenue: { 
        total: totalRevenue, 
        change: Math.round(revenueChange) 
      },
      orders: { 
        total: totalOrdersCount, 
        change: Math.round(ordersChange) 
      },
      customers: { 
        total: uniqueCustomers, 
        change: Math.round(customersChange) 
      },
      conversion: { 
        rate: conversionRate, 
        change: 0 
      },
      topProducts,
      salesByDay,
      categoryBreakdown,
      recentOrders: paidOrders.slice(0, 5).map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || order.user?.email || "Guest",
        amount: order.total.toNumber(),
        status: order.status,
        createdAt: order.createdAt,
      })),
    };
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}