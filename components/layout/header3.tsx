// components/layout/header3.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, ChevronDown, Menu, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

interface Category {
  name: string;
  href: string;
  subcategories?: { name: string; href: string }[];
}

const categories: Category[] = [
  {
    name: "Electronics",
    href: "/products?category=electronics",
    subcategories: [
      { name: "Phones", href: "/products?category=electronics&sub=phones" },
      { name: "Laptops", href: "/products?category=electronics&sub=laptops" },
    ],
  },
  {
    name: "Fashion",
    href: "/products?category=fashion",
    subcategories: [
      { name: "Men", href: "/products?category=fashion&sub=men" },
      { name: "Women", href: "/products?category=fashion&sub=women" },
    ],
  },
];

export function Header3() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className={`text-2xl font-bold ${isScrolled ? "text-blue-600" : "text-white"}`}>
            E-Store
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className={`${isScrolled ? "text-gray-700" : "text-white"} hover:text-blue-500`}>
              Home
            </Link>
            
            {categories.map((category) => (
              <div
                key={category.name}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(category.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className={`flex items-center gap-1 ${isScrolled ? "text-gray-700" : "text-white"} hover:text-blue-500`}>
                  {category.name} <ChevronDown className="w-4 h-4" />
                </button>
                {openDropdown === category.name && category.subcategories && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <Link href="/deals" className={`${isScrolled ? "text-gray-700" : "text-white"} hover:text-blue-500`}>
              Deals
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-full ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
              <Search className={`w-5 h-5 ${isScrolled ? "text-gray-700" : "text-white"}`} />
            </button>
            <button className="relative p-2 rounded-full hover:bg-white/10">
              <ShoppingCart className={`w-5 h-5 ${isScrolled ? "text-gray-700" : "text-white"}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button className={`p-2 rounded-full ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
              <User className={`w-5 h-5 ${isScrolled ? "text-gray-700" : "text-white"}`} />
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-white/10">
              <Menu className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`} />
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
              <span className="text-xl font-bold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <nav className="space-y-4">
              <Link href="/" className="block py-2 text-gray-700">Home</Link>
              {categories.map((cat) => (
                <div key={cat.name}>
                  <p className="font-semibold text-gray-900 py-2">{cat.name}</p>
                  <div className="pl-4 space-y-2">
                    {cat.subcategories?.map((sub) => (
                      <Link key={sub.name} href={sub.href} className="block py-1 text-sm text-gray-600">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}