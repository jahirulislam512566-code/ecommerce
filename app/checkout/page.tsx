"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  CreditCard,
  Truck,
  MapPin,
  Clock,
  Shield,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Wallet,
  Building2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Address {
  id?: string;
  name: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

interface CheckoutFormData {
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
  sameAsShipping: boolean;
  notes: string;
  shippingMethod: string;
  paymentMethod: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, getSubtotal, getTotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: session?.user?.email || "",
    shippingAddress: {
      name: "",
      street: "",
      street2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      phone: "",
    },
    billingAddress: {
      name: "",
      street: "",
      street2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      phone: "",
    },
    sameAsShipping: true,
    notes: "",
    shippingMethod: "standard",
    paymentMethod: "card",
  });

  const subtotal = getSubtotal();
  const shippingCost = formData.shippingMethod === "express" ? 15 : subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  useEffect(() => {
    fetchSavedAddresses();
  }, [session]);

  const fetchSavedAddresses = async () => {
    if (!session) return;
    try {
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setFormData({
        ...formData,
        shippingAddress: address,
        billingAddress: formData.sameAsShipping ? address : formData.billingAddress,
      });
      setSelectedAddressId(addressId);
    }
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    if (section === "shippingAddress" || section === "billingAddress") {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof CheckoutFormData] as Address,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [section]: value,
      });
    }
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setFormData({
      ...formData,
      sameAsShipping: checked,
      billingAddress: checked ? formData.shippingAddress : {
        name: "",
        street: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
    });
  };

 const createOrder = async () => {
  setIsLoading(true);
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        shippingCost,
        tax,
        total,
        notes: formData.notes,
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
      }),
    });

    // Get response text first for debugging
    const responseText = await response.text();
    console.log("Response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", responseText);
      throw new Error("Invalid response from server");
    }
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to create order");
    }
    
    if (data.success) {
      setOrderId(data.order.id);
      
      if (data.requiresPayment && formData.paymentMethod === "card") {
        // Create payment intent for Stripe
        const paymentResponse = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.order.id }),
        });
        
        const paymentText = await paymentResponse.text();
        const paymentData = JSON.parse(paymentText);
        setClientSecret(paymentData.clientSecret);
        setStep(2);
      } else {
        // COD - redirect to success page
        router.push(`/checkout/success/${data.order.id}`);
      }
    }
  } catch (error) {
    console.error("Error creating order:", error);
    alert(error instanceof Error ? error.message : "Failed to create order. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  const nextStep = () => {
    if (step === 2) {
      createOrder();
    } else {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Continue Shopping <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 2 && <div className={`w-16 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-24 mt-2 text-sm">
            <span className={step >= 1 ? "text-blue-600" : "text-gray-500"}>Information</span>
            <span className={step >= 2 ? "text-blue-600" : "text-gray-500"}>Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Shipping Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" value={formData.email} onChange={(e) => handleInputChange("email", "", e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>

                  {session && savedAddresses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Saved Addresses</label>
                      <select value={selectedAddressId} onChange={(e) => handleAddressSelect(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">+ Use a new address</option>
                        {savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>{addr.name} - {addr.street}, {addr.city}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" value={formData.shippingAddress.name}
                        onChange={(e) => handleInputChange("shippingAddress", "name", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input type="tel" value={formData.shippingAddress.phone}
                        onChange={(e) => handleInputChange("shippingAddress", "phone", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg" required /></div>
                  </div>

                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input type="text" value={formData.shippingAddress.street}
                      onChange={(e) => handleInputChange("shippingAddress", "street", e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg" required /></div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-1"><label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input type="text" value={formData.shippingAddress.city}
                        onChange={(e) => handleInputChange("shippingAddress", "city", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg" required /></div>
                    <div className="col-span-1"><label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input type="text" value={formData.shippingAddress.state}
                        onChange={(e) => handleInputChange("shippingAddress", "state", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg" required /></div>
                    <div className="col-span-1"><label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
                      <input type="text" value={formData.shippingAddress.postalCode}
                        onChange={(e) => handleInputChange("shippingAddress", "postalCode", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg" required /></div>
                    <div className="col-span-1"><label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <select value={formData.shippingAddress.country}
                        onChange={(e) => handleInputChange("shippingAddress", "country", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg">
                        <option value="US">United States</option><option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option><option value="AU">Australia</option>
                      </select></div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-600" /> Shipping Method
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-blue-500">
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shippingMethod" value="standard" checked={formData.shippingMethod === "standard"}
                            onChange={(e) => handleInputChange("shippingMethod", "", e.target.value)} className="w-4 h-4 text-blue-600" />
                          <div><p className="font-medium">Standard Shipping</p><p className="text-sm text-gray-500">3-5 business days</p></div>
                        </div>
                        <span className="font-semibold">{subtotal > 50 ? "Free" : "$5.00"}</span>
                      </label>
                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-blue-500">
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shippingMethod" value="express" checked={formData.shippingMethod === "express"}
                            onChange={(e) => handleInputChange("shippingMethod", "", e.target.value)} className="w-4 h-4 text-blue-600" />
                          <div><p className="font-medium">Express Shipping</p><p className="text-sm text-gray-500">1-2 business days</p></div>
                        </div>
                        <span className="font-semibold">$15.00</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.sameAsShipping}
                        onChange={(e) => handleSameAsShippingChange(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                      <span>Billing address same as shipping</span>
                    </label>
                  </div>

                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                    <textarea rows={2} value={formData.notes}
                      onChange={(e) => handleInputChange("notes", "", e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg" placeholder="Special instructions..." /></div>

                  <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" /> Payment Method
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Stripe Payment */}
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                    <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === "card"}
                      onChange={(e) => handleInputChange("paymentMethod", "", e.target.value)} className="w-4 h-4 text-blue-600" />
                    <div className="flex-1"><p className="font-medium">Credit / Debit Card</p><p className="text-sm text-gray-500">Pay with Stripe</p></div>
                    <div className="flex gap-2 text-2xl">💳</div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === "cod"}
                      onChange={(e) => handleInputChange("paymentMethod", "", e.target.value)} className="w-4 h-4 text-blue-600" />
                    <div className="flex-1"><p className="font-medium">Cash on Delivery</p><p className="text-sm text-gray-500">Pay when you receive your order</p></div>
                    <div className="text-2xl">💰</div>
                  </label>
                </div>

                {/* Stripe Payment Form */}
                {formData.paymentMethod === "card" && clientSecret && (
                  <div className="border-t pt-6">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm orderId={orderId!} />
                    </Elements>
                  </div>
                )}

                {/* COD Info */}
                {formData.paymentMethod === "cod" && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">You'll pay when your order arrives. Please have exact cash ready.</p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button onClick={prevStep} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50">
                    Back
                  </button>
                  <button onClick={nextStep} disabled={isLoading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                    {isLoading ? "Processing..." : `Pay ${formData.paymentMethod === "cod" ? "with COD" : "Now"}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-900 mt-1">${item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-sm"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="border-t pt-2 mt-2"><div className="flex justify-between font-semibold text-lg">
                  <span>Total</span><span className="text-blue-600">${total.toFixed(2)}</span>
                </div></div>
              </div>
              <div className="mt-6 pt-6 border-t flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" /><span>Secure Checkout</span><Clock className="w-4 h-4 ml-2" /><span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stripe Payment Form Component
function StripePaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success/${orderId}`,
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "Payment failed");
        setIsProcessing(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
      <p className="text-xs text-gray-500 text-center">Test card: 4242 4242 4242 4242 | Exp: 12/34 | CVC: 123</p>
    </form>
  );
}