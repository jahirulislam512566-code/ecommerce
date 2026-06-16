"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Package, MapPin, Heart, TrendingUp } from "lucide-react"

interface Stats {
  totalOrders: number
  totalSpent: number
  wishlistCount: number
  addressCount: number
}

export function ProfileOverview() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    addressCount: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentOrders()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/user/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch("/api/orders?limit=3")
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error)
    }
  }

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: Package,
      color: "bg-blue-500",
      link: "/profile?tab=orders",
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-green-500",
      link: "/profile?tab=orders",
    },
    {
      title: "Wishlist",
      value: stats.wishlistCount,
      icon: Heart,
      color: "bg-red-500",
      link: "/profile?tab=wishlist",
    },
    {
      title: "Addresses",
      value: stats.addressCount,
      icon: MapPin,
      color: "bg-purple-500",
      link: "/profile?tab=addresses",
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Welcome back, {session?.user?.name || "Valued Customer"}!
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.link}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{card.value}</span>
              </div>
              <p className="text-sm text-gray-600">{card.title}</p>
            </Link>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Link href="/profile?tab=orders" className="text-blue-600 hover:text-blue-700 text-sm">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No orders yet</p>
            <Link href="/products" className="text-blue-600 text-sm mt-2 inline-block">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}