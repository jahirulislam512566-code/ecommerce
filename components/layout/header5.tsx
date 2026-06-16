// components/layout/header5.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Heart, Menu, X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, CartItem } from "@/stores/cartStore";

export function Header5() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { items, removeItem, updateQuantity, getTotalItems, getSubtotal } = useCartStore();
  
  // Safe values - will update after hydration
  const cartCount = mounted ? getTotalItems() : 0;
  const subtotal = mounted ? getSubtotal() : 0;

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Force rehydration of persisted store
    useCartStore.persist.rehydrate();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // Handle remove item
  const handleRemoveItem = (id: string | number) => {
    removeItem(id);
  };

  // Handle quantity update
  const handleUpdateQuantity = (id: string | number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  // Sample products for testing - replace with your actual products
  const sampleProduct: CartItem = {
    id: 1,
    name: "Sample Product",
    price: 29.99,
    quantity: 1,
    image: "/api/placeholder/80/80"
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-gray-900 shadow-lg" : "bg-gray-900"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
              E-Store
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
              <Link href="/products" className="text-gray-300 hover:text-white transition">Shop</Link>
              <Link href="/deals" className="text-gray-300 hover:text-white transition">Deals</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-300 hover:text-white rounded-full transition">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-300 hover:text-white rounded-full transition">
                <Heart className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-white rounded-full transition"
              >
                <ShoppingCart className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="p-2 text-gray-300 hover:text-white rounded-full transition">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="lg:hidden p-2 text-gray-300 hover:text-white rounded-full transition"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-80 bg-gray-900 z-50 shadow-xl p-6 animate-slide-right">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-white hover:text-gray-300 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                {["Home", "Shop", "Deals", "About", "Contact"].map((item) => (
                  <Link
                    key={item}
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="block py-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </nav>
              
              {/* Add to cart test button - remove in production */}
              <div className="mt-8 pt-8 border-t border-gray-800">
                <button
                  onClick={() => useCartStore.getState().addItem(sampleProduct)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Test Item
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Slide-out Cart Drawer */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setCartOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-50 shadow-xl flex flex-col animate-slide-left">
            {/* Cart Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold">
                Shopping Cart 
                {mounted && cartCount > 0 && (
                  <span className="text-sm text-gray-500 ml-2">({cartCount} items)</span>
                )}
              </h2>
              <button 
                onClick={() => setCartOpen(false)} 
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {!mounted ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Continue Shopping →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Link 
                            href={`/product/${item.slug || item.id}`}
                            className="font-medium text-gray-800 hover:text-blue-600 transition"
                            onClick={() => setCartOpen(false)}
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 border rounded hover:bg-gray-200 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 border rounded hover:bg-gray-200 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Cart Footer */}
            {mounted && items.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-600">Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full mt-2 text-center text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add animations */}
      <style jsx>{`
        @keyframes slideRight {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slide-right {
          animation: slideRight 0.3s ease-out;
        }
        
        .animate-slide-left {
          animation: slideLeft 0.3s ease-out;
        }
      `}</style>
    </>
  );
}