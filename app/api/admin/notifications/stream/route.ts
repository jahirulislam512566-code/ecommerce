import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      let lastOrderCount = await prisma.order.count();
      
      // Check for new orders every 5 seconds
      const interval = setInterval(async () => {
        const currentOrderCount = await prisma.order.count();
        
        if (currentOrderCount > lastOrderCount) {
          // Get the new orders
          const newOrders = await prisma.order.findMany({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 5 * 60 * 1000),
              },
            },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          });
          
          const eventData = {
            type: "new-orders",
            orders: newOrders.map(order => ({
              id: order.id,
              orderNumber: order.orderNumber,
              total: order.total.toNumber(),
              customerName: order.user?.name || "Guest",
            })),
          };
          
          controller.enqueue(`data: ${JSON.stringify(eventData)}\n\n`);
          lastOrderCount = currentOrderCount;
        }
      }, 5000);
      
      // Clean up interval when connection closes
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}