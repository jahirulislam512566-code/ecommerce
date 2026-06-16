// components/layout/header1.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  User, 
  Heart,
  ChevronDown,
  LogOut,
  Settings,
  Package
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  megaMenu?: MegaMenuItem[];
}

interface MegaMenuItem {
  category: string;
  items: { name: string; href: string }[];
}

const megaMenuItems: MegaMenuItem[] = [
  {
    category: "Electronics",
    items: [
      { name: "Smartphones", href: "/products?category=electronics&sub=smartphones" },
      { name: "Laptops", href: "/products?category=electronics&sub=laptops" },
      { name: "Headphones", href: "/products?category=electronics&sub=headphones" },
    ],
  },
  {
    category: "Clothing",
    items: [
      { name: "Men", href: "/products?category=clothing&sub=men" },
      { name: "Women", href: "/products?category=clothing&sub=women" },
      { name: "Accessories", href: "/products?category=clothing&sub=accessories" },
    ],
  },
];

export function Header1() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: session } = useSession();
  const { getTotalItems } = useCartStore();
  const pathname = usePathname();
  const cartCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm border-b"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">E-Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <div 
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
              className="relative"
            >
              <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
                Shop <ChevronDown className="w-4 h-4" />
              </button>
              {megaMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {megaMenuItems.map((category) => (
                      <div key={category.category}>
                        <h4 className="font-semibold text-gray-900 mb-3">{category.category}</h4>
                        <ul className="space-y-2">
                          {category.items.map((item) => (
                            <li key={item.name}>
                              <Link href={item.href} className="text-sm text-gray-600 hover:text-blue-600">
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/deals" className="text-gray-700 hover:text-blue-600">Deals</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <User className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <nav className="space-y-4">
                <Link href="/" className="block py-2 text-gray-700 hover:text-blue-600">Home</Link>
                <Link href="/products" className="block py-2 text-gray-700 hover:text-blue-600">Shop</Link>
                <Link href="/deals" className="block py-2 text-gray-700 hover:text-blue-600">Deals</Link>
                <Link href="/contact" className="block py-2 text-gray-700 hover:text-blue-600">Contact</Link>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
}