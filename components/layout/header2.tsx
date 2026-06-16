// components/layout/header2.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Heart, Menu, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export function Header2() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-white shadow-lg" 
        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="text-2xl font-bold">
            <span className={isScrolled ? "text-blue-600" : "text-white"}>E-Store</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Shop", "Deals", "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className={`transition-colors ${
                  isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white/90 hover:text-white"
                }`}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-white/10">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10">
              <Heart className="w-5 h-5" />
            </button>
            <button className="relative p-2 rounded-full hover:bg-white/10">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-white/10">
              <User className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-full hover:bg-white/10">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-80 bg-white z-50 shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <nav className="space-y-4">
              {["Home", "Shop", "Deals", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}