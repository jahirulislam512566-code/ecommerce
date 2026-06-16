// components/products/product-card.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Eye, Star, Check } from "lucide-react";
import type { Product, CartItem } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (item: CartItem) => void;
  variant?: "default" | "compact" | "featured";
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
}

type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function ProductCard({ 
  product, 
  onAddToCart, 
  variant = "default",
  showQuickView = true,
  onQuickView
}: ProductCardProps) {
  const { addItem, items } = useCartStore();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Load wishlist from localStorage
    const wishlist = localStorage.getItem('wishlist');
    if (wishlist) {
      const wishlistItems = JSON.parse(wishlist);
      setIsInWishlist(wishlistItems.includes(product.id));
    }
  }, [product.id]);

  // Calculate stock status with safe defaults
  const getStockStatus = (): StockStatus => {
    if (!product) return "OUT_OF_STOCK";
    const quantity = product.quantity ?? product.stock ?? 0;
    const inStock = product.inStock ?? (quantity > 0);
    
    if (!inStock || quantity === 0) return "OUT_OF_STOCK";
    const threshold = product.lowStockThreshold ?? 5;
    if (quantity <= threshold) return "LOW_STOCK";
    return "IN_STOCK";
  };

  // Calculate discount
  const calculateDiscount = (): number => {
    if (!product.compareAtPrice && !product.comparePrice) return 0;
    const comparePrice = product.compareAtPrice ?? product.comparePrice ?? 0;
    const currentPrice = product.price ?? product.salePrice ?? 0;
    if (comparePrice <= currentPrice) return 0;
    return Math.round(((comparePrice - currentPrice) / comparePrice) * 100);
  };

  const stockStatus = getStockStatus();
  const discount = calculateDiscount();
  const primaryImage = product.images?.[0] || product.image;
  const currentPrice = product.salePrice ?? product.price ?? 0;
  const comparePrice = product.compareAtPrice ?? product.comparePrice ?? 0;
  const isOutOfStock = stockStatus === "OUT_OF_STOCK";

  // Handle add to cart
  const handleAddToCart = async () => {
    if (isOutOfStock || isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    const cartItem: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      quantity: 1,
      image: typeof primaryImage === 'string' ? primaryImage : primaryImage?.url || "/placeholder.jpg",
      maxStock: product.quantity ?? product.stock ?? 0,
    };
    
    try {
      await addItem(cartItem);
      setShowAddedFeedback(true);
      setTimeout(() => setShowAddedFeedback(false), 2000);
      onAddToCart?.(cartItem);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlist = () => {
    if (!mounted) return;
    
    const newWishlistState = !isInWishlist;
    setIsInWishlist(newWishlistState);
    
    // Save to localStorage
    const wishlist = localStorage.getItem('wishlist');
    let wishlistItems = wishlist ? JSON.parse(wishlist) : [];
    
    if (newWishlistState) {
      wishlistItems.push(product.id);
    } else {
      wishlistItems = wishlistItems.filter((id: number) => id !== product.id);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  };

  // Variant-specific classes
  const variantClasses = {
    default: "bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300",
    compact: "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
    featured: "bg-white rounded-xl shadow-lg hover:shadow-2xl border-2 border-blue-100 transition-all duration-300",
  };
  
  const imageSizes = {
    default: "aspect-square",
    compact: "aspect-square",
    featured: "aspect-[4/3]",
  };

  // Don't render during SSR to prevent hydration issues
  if (!mounted) {
    return (
      <div className={cn("animate-pulse", variantClasses[variant])}>
        <div className={cn("bg-gray-200", imageSizes[variant])} />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("group relative overflow-hidden", variantClasses[variant])}>
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          -{discount}%
        </div>
      )}
      
      {/* New Badge */}
      {product.isNew && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          NEW
        </div>
      )}
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-all",
            isInWishlist ? "fill-red-500 text-red-500 scale-110" : "text-gray-600 hover:text-red-500"
          )}
        />
      </button>
      
      {/* Quick View Button */}
      {showQuickView && onQuickView && (
        <button
          onClick={() => onQuickView(product)}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Quick view"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      )}
      
      {/* Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
          <span className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
            Out of Stock
          </span>
        </div>
      )}
      
      {/* Low Stock Badge */}
      {stockStatus === "LOW_STOCK" && !isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
          Low Stock
        </div>
      )}
      
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <div className={cn("relative bg-gradient-to-br from-gray-50 to-gray-100", imageSizes[variant])}>
          {primaryImage && !imageError ? (
            <>
              <Image
                src={typeof primaryImage === 'string' ? primaryImage : primaryImage.url}
                alt={typeof primaryImage === 'string' ? product.name : (primaryImage.altText || product.name)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-500 group-hover:scale-105",
                  !isImageLoaded && "scale-105 blur-sm",
                  isImageLoaded && "blur-0"
                )}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setImageError(true)}
                priority={false}
              />
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400 mt-2">No image available</span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link
            href={`/products?category=${typeof product.category === 'string' ? product.category : product.category.slug}`}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-wide"
          >
            {typeof product.category === 'string' ? product.category : product.category.name}
          </Link>
        )}
        
        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className={cn(
            "mt-1 font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2",
            variant === "compact" ? "text-sm" : "text-base"
          )}>
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < Math.floor(product.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className={cn(
            "font-bold text-gray-900",
            variant === "compact" ? "text-lg" : "text-xl"
          )}>
            ${currentPrice.toFixed(2)}
          </span>
          {comparePrice > currentPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Stock Status Text */}
        {stockStatus === "LOW_STOCK" && !isOutOfStock && (
          <p className="text-xs text-orange-600 font-medium mt-1">
            Only {product.quantity || product.stock} left in stock
          </p>
        )}
        
        {/* Add to Cart Button with Feedback */}
        {!isOutOfStock ? (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={cn(
              "mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all",
              variant === "compact" ? "text-sm" : "text-base",
              "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
              showAddedFeedback && "bg-green-600 hover:bg-green-700"
            )}
          >
            {showAddedFeedback ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Added to Cart!</span>
              </>
            ) : isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Out of Stock</span>
          </button>
        )}
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-lg pointer-events-none transition-all duration-300" />
    </div>
  );
}