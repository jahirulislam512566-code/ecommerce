"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Tag,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  ShoppingBag,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

// Notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: "order" | "stock" | "user";
  link: string;
}

// Order type for API response
interface Order {
  id: string;
  orderNumber: string;
  total: number;
  customerName: string;
  createdAt: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle authentication and authorization
  useEffect(() => {
    if (status === "loading") return;
    
    // Not authenticated - redirect to login
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }
    
    // Authenticated but not admin - redirect to home
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Fetch initial order count and set mounted state
  useEffect(() => {
    const fetchInitialOrderCount = async () => {
      try {
        const response = await fetch("/api/admin/orders/count");
        const data = await response.json();
        // Store count in a ref or use for initial check
        const initialCount = data.count;
        console.log(`Initial order count: ${initialCount}`);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };
    
    if (session?.user?.role === "ADMIN") {
      fetchInitialOrderCount();
      setIsMounted(true);
    }
  }, [session]);

  // Poll for new orders every 10 seconds
  useEffect(() => {
    if (!isMounted || session?.user?.role !== "ADMIN") return;

    const checkNewOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders/recent");
        const data = await response.json();
        
        if (data.newOrders && data.newOrders.length > 0) {
          // Add new order notifications with proper typing
          const newNotifications: Notification[] = data.newOrders.map((order: Order) => ({
            id: order.id,
            title: `New Order #${order.orderNumber}`,
            message: `$${order.total.toFixed(2)} from ${order.customerName}`,
            time: new Date(order.createdAt),
            read: false,
            type: "order" as const,
            link: `/admin/orders/${order.id}`,
          }));
          
          setNotifications(prev => [...newNotifications, ...prev]);
          
          // Play notification sound
          const audio = new Audio("/notification.mp3");
          audio.play().catch(e => console.log("Audio play failed:", e));
          
          // Show browser notification with proper type
          if (Notification.permission === "granted") {
            newNotifications.forEach((notification: Notification) => {
              new Notification(notification.title, {
                body: notification.message,
                icon: "/favicon.ico",
              });
            });
          }
        }
      } catch (error) {
        console.error("Error checking new orders:", error);
      }
    };
    
    // Initial check
    checkNewOrders();
    
    // Set up interval
    const interval = setInterval(checkNewOrders, 10000);
    
    return () => clearInterval(interval);
  }, [isMounted, session]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, { method: "POST" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    try {
      await fetch("/api/admin/notifications/read-all", { method: "POST" });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {session.user?.name?.[0] || "A"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {session.user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => router.push("/api/auth/signout")}
            className="flex items-center gap-3 px-3 py-2 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
                Welcome back, {session.user?.name?.split(" ")[0] || "Admin"}!
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 overflow-hidden">
                      <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Notifications ({unreadCount} unread)
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              href={notification.link}
                              onClick={() => {
                                markAsRead(notification.id);
                                setShowNotifications(false);
                              }}
                              className={`block p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  {notification.type === "order" ? (
                                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                                  ) : (
                                    <Bell className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.time).toLocaleTimeString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {session.user?.name?.[0] || "A"}
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                      <Link
                        href="/admin/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        System Settings
                      </Link>
                      <div className="border-t dark:border-gray-700">
                        <button
                          onClick={() => router.push("/api/auth/signout")}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}