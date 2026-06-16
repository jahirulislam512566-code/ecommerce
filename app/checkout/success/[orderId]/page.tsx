"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Printer, AlertCircle, ArrowLeft, ShoppingBag, MapPin, CreditCard } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { clearCart, getTotalItems, initialize } = useCartStore();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }
    
    // Clear cart when order is successful
    const clearUserCart = async () => {
      if (!cartCleared) {
        console.log("Clearing cart after successful order...");
        try {
          await clearCart();
          // Also clear localStorage
          localStorage.removeItem("cart-storage");
          // Dispatch event for header to update
          window.dispatchEvent(new Event("cart-updated"));
          window.dispatchEvent(new Event("storage"));
          console.log("Cart cleared successfully");
          setCartCleared(true);
        } catch (error) {
          console.error("Error clearing cart:", error);
        }
      }
    };
    
    clearUserCart();
    fetchOrderDetails();
  }, [orderId, router, clearCart, cartCleared]);

  const fetchOrderDetails = async () => {
    try {
      // First, try to get order from localStorage (for COD orders)
      const savedOrder = localStorage.getItem(`order_${orderId}`);
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
        setIsLoading(false);
        return;
      }

      // If not in localStorage, try to fetch from API
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        // If API fails, create a mock order for display
        const mockOrder: Order = {
          id: orderId,
          orderNumber: `ORD-${orderId.substring(0, 8).toUpperCase()}`,
          status: "PROCESSING",
          paymentStatus: "PAID",
          paymentMethod: "Cash on Delivery",
          total: 0,
          subtotal: 0,
          tax: 0,
          shippingCost: 0,
          createdAt: new Date().toISOString(),
          items: [],
          shippingAddress: {
            name: "Customer",
            street: "Address",
            city: "City",
            state: "ST",
            postalCode: "12345",
            country: "US",
          },
        };
        setOrder(mockOrder);
      } else {
        const data = await response.json();
        setOrder({
          ...data.order,
          paymentMethod: data.order.paymentMethod || (data.order.paymentIntentId ? "Credit Card" : "Cash on Delivery"),
        });
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      // Create a basic order so page still displays
      const basicOrder: Order = {
        id: orderId,
        orderNumber: `ORD-${orderId.substring(0, 8).toUpperCase()}`,
        status: "PROCESSING",
        paymentStatus: "PENDING",
        paymentMethod: "Pending",
        total: 0,
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        createdAt: new Date().toISOString(),
        items: [],
        shippingAddress: {
          name: "Customer",
          street: "Address",
          city: "City",
          state: "ST",
          postalCode: "12345",
          country: "US",
        },
      };
      setOrder(basicOrder);
      setError("Could not load order details, but your order has been placed.");
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
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      FAILED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your order.</p>
          <Link href="/" className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Success Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 text-center border-b border-green-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">Thank you for your purchase.</p>
            <div className="inline-block bg-white rounded-lg px-6 py-3 shadow-sm">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{order.orderNumber}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6 md:p-8">
            {/* Order Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900">{order.paymentMethod || "Cash on Delivery"}</p>
              </div>
            </div>

            {/* Order Items */}
            {order.items.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Order Items
                </h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-blue-600 text-xl font-bold">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            </div>

            {/* Note about error */}
            {error && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/orders"
                className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                View All Orders
              </Link>
              <Link
                href="/products"
                className="flex-1 border border-gray-300 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>
              <button
                onClick={() => window.print()}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}