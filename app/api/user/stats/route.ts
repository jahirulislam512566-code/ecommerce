import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [totalOrders, totalSpent, wishlistCount, addressCount] = await Promise.all([
      prisma.order.count({
        where: { userId: session.user.id },
      }),
      prisma.order.aggregate({
        where: { userId: session.user.id, status: "DELIVERED" },
        _sum: { total: true },
      }),
      prisma.wishlistItem.count({
        where: { userId: session.user.id },
      }),
      prisma.address.count({
        where: { userId: session.user.id },
      }),
    ])

    return NextResponse.json({
      totalOrders,
      totalSpent: totalSpent._sum.total?.toNumber() || 0,
      wishlistCount,
      addressCount,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}