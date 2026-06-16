"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Package,
  LayoutDashboard,
  Zap,
  Gift,
  Phone,
  MapPin,
  ChevronRight,
  Truck,
  RotateCcw
} from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products", megaMenu: true },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const megaMenuCategories = [
  {
    title: "Electronics",
    items: ["Smartphones", "Laptops", "Audio", "Cameras", "Gaming", "Accessories"],
    icon: "💻",
    href: "/products?category=electronics",
  },
  {
    title: "Fashion",
    items: ["Men's Clothing", "Women's Clothing", "Footwear", "Accessories", "Bags", "Watches"],
    icon: "👕",
    href: "/products?category=clothing",
  },
  {
    title: "Home & Living",
    items: ["Furniture", "Decor", "Kitchen", "Bedding", "Lighting", "Storage"],
    icon: "🏠",
    href: "/products?category=home-living",
  },
  {
    title: "Sports & Outdoors",
    items: ["Exercise", "Camping", "Cycling", "Fishing", "Team Sports", "Outdoor Gear"],
    icon: "⚽",
    href: "/products?category=sports",
  },
];

const categories = [
  { name: "Electronics", href: "/products?category=electronics", icon: "💻", count: 245 },
  { name: "Fashion", href: "/products?category=clothing", icon: "👕", count: 532 },
  { name: "Home & Living", href: "/products?category=home-living", icon: "🏠", count: 189 },
  { name: "Sports", href: "/products?category=sports", icon: "⚽", count: 156 },
  { name: "Books", href: "/products?category=books", icon: "📚", count: 423 },
  { name: "Toys", href: "/products?category=toys", icon: "🎮", count: 267 },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const { getTotalItems, initialize } = useCartStore();

  // Set mounted state for hydration safety
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    initialize();
    
    // Update cart count
    const updateCartCount = () => {
      setCartCount(getTotalItems());
    };
    
    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener("cart-updated", updateCartCount);
    
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, [getTotalItems, initialize]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchSearchSuggestions(searchQuery);
      } else {
        setSearchSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchSearchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSearchSuggestions(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/product/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const cartItemsCount = cartCount;

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm border-b"
      }`}>
        {/* Top Bar - Uncomment if needed */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>30-Day Returns</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span>Rewards Program</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/track-order" className="hover:text-blue-200 transition-colors flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Track Order
                </Link>
                <Link href="/help" className="hover:text-blue-200 transition-colors flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Help Center
                </Link>
                <div className="hidden sm:flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Store Locator</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="mr-10 font-bold text-3xl">E Store</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.megaMenu ? (
                    <div
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                      className="relative"
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all ${
                          pathname === item.href ? "text-blue-600 font-semibold bg-blue-50" : ""
                        }`}
                      >
                        {item.name}
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown className="w-3 h-3" />
                      </Link>
                      
                      {/* Mega Menu Dropdown */}
                      {megaMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 w-screen max-w-5xl bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
                          <div className="grid grid-cols-4 gap-6 p-6">
                            {megaMenuCategories.map((category) => (
                              <div key={category.title} className="space-y-3">
                                <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-5xl">{category.icon}</span>
                                </div>
                                <h4 className="font-semibold text-gray-900">{category.title}</h4>
                                <ul className="space-y-2">
                                  {category.items.map((subItem) => (
                                    <li key={subItem}>
                                      <Link
                                        href={`${category.href}&subcategory=${subItem.toLowerCase()}`}
                                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                      >
                                        {subItem}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <Link
                                  href={category.href}
                                  className="text-sm text-blue-600 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                                >
                                  Shop All
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              </div>
                            ))}
                          </div>
                          <div className="bg-gray-50 p-4 border-t">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm font-medium">Limited Time Offer</span>
                                <span className="text-sm text-gray-600">Up to 50% off on selected items</span>
                              </div>
                              <Link href="/products?sort=price_asc" className="text-blue-600 text-sm font-medium">
                                View All Deals →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all ${
                        pathname === item.href ? "text-blue-600 font-semibold bg-blue-50" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Search Bar */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products, brands, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full px-4 py-2 pl-11 pr-12 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* Search Suggestions Dropdown */}
                {isSearchFocused && searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b">
                      <p className="text-xs text-gray-500">Suggestions</p>
                    </div>
                    {searchSuggestions.map((product: any) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.slug)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={product.images?.[0]?.url || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">${product.price?.toFixed(2)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                    <div className="p-2 border-t">
                      <button
                        type="submit"
                        className="w-full text-center text-sm text-blue-600 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        See all results for "{searchQuery}"
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/profile?tab=wishlist"
                className="hidden sm:flex p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors relative group"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute inset-0 bg-red-100 rounded-full scale-0 group-hover:scale-100 transition-transform" />
              </Link>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {isMounted && cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-bounce">
                    {cartItemsCount > 99 ? "99+" : cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="relative">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    {isMounted && session && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 hidden md:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border overflow-hidden z-50">
                      {session ? (
                        <>
                          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {session.user?.name?.[0] || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{session.user?.name || "User"}</p>
                                <p className="text-xs text-gray-500">{session.user?.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <User className="w-4 h-4" />
                              My Profile
                            </Link>
                            <Link
                              href="/orders"
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Package className="w-4 h-4" />
                              My Orders
                            </Link>
                            <Link
                              href="/wishlist"
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Heart className="w-4 h-4" />
                              Wishlist
                            </Link>
                            <Link
                              href="/profile?tab=settings"
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                            {session.user?.role === "ADMIN" && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <LayoutDashboard className="w-4 h-4" />
                                Admin Panel
                              </Link>
                            )}
                          </div>
                          <div className="border-t p-2">
                            <button
                              onClick={() => window.location.href = "/api/auth/signout"}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4">
                          <Link
                            href="/auth/signin"
                            className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-2"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/auth/signup"
                            className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Create Account
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Open Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Field panel */}
        {isSearchOpen && (
          <div className="lg:hidden p-4 border-t bg-white shadow-lg">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu Drawer Overlay */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-85 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="text-xl font-bold">Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {!session && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Welcome to E-Store!</p>
                    <div className="flex gap-2">
                      <Link
                        href="/auth/signin"
                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="flex-1 border border-gray-300 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="px-4 py-2 text-sm font-semibold text-gray-500">Shop by Category</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-400 ml-1">({category.count})</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-around">
                  <Link href="/track-order" className="text-xs text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                    Track Order
                  </Link>
                  <Link href="/help" className="text-xs text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                    Help
                  </Link>
                  <Link href="/returns" className="text-xs text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                    Returns
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

// Mic helper icon component
function Mic(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"  
      strokeLinejoin="round" 
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}