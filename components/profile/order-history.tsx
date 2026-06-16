"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Eye, ChevronRight } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    productName: string;
  }>;
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        // Ensure items is always an array
        const ordersWithItems = (data.orders || []).map((order: Order) => ({
          ...order,
          items: order.items || [],
        }));
        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      CONFIRMED: "bg-purple-100 text-purple-700",
      SHIPPED: "bg-indigo-100 text-indigo-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      REFUNDED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-6">When you place your first order, it will appear here</p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                {/* Safely access items.length */}
                <p className="text-sm text-gray-500">
                  {order.items?.length || 0} items
                </p>
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  {expandedOrder === order.id ? "Hide Details" : "View Details"}
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? "rotate-90" : ""}`} />
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total amount</p>
                  <p className="text-xl font-bold text-gray-900">${order.total?.toFixed(2) || "0.00"}</p>
                </div>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                >
                  View Full Order
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Order Details (Expanded) */}
            {expandedOrder === order.id && (
              <div className="border-t p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Order Items</h4>
                <div className="space-y-3">
                  {/* Safely check if items exist and has length */}
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName || "Product"}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 0}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No items details available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}