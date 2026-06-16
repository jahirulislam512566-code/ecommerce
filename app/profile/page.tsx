"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Package, MapPin, Heart, Settings, LogOut } from "lucide-react"
import { ProfileOverview } from "@/components/profile/profile-overview"
import { OrderHistory } from "@/components/profile/order-history"
import { AddressBook } from "@/components/profile/address-book"
import { WishlistOverview } from "@/components/profile/wishlist-overview"
import { AccountSettings } from "@/components/profile/account-settings"

type TabType = "overview" | "orders" | "addresses" | "wishlist" | "settings"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
        </div>
      </div>
    )
  }

  if (!session) return null

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">Manage your profile, orders, and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{session.user?.name || "User"}</h3>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors
                        ${activeTab === tab.id
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
                
                <hr className="my-2" />
                
                <button
                  onClick={() => router.push("/api/auth/signout")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === "overview" && <ProfileOverview />}
              {activeTab === "orders" && <OrderHistory />}
              {activeTab === "addresses" && <AddressBook />}
              {activeTab === "wishlist" && <WishlistOverview />}
              {activeTab === "settings" && <AccountSettings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}