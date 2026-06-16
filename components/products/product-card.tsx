// components/products/product-card.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import type { Product, CartItem } from "@/types";
import type { CartStore } from "@/stores/cartStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (item: CartItem) => void;
  variant?: "default" | "compact" | "featured";
  showQuickView?: boolean;
}

type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function ProductCard({ 
  product, 
  onAddToCart, 
  variant = "default",
  showQuickView = true 
}: ProductCardProps) {
  const addToCart = useCartStore((state: CartStore) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isWishlisted = isInWishlist(product.id);
  const stockStatus = getStockStatus(product);
  const discount = calculateDiscount(product);
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: 1,
      image: primaryImage?.url || "/placeholder.jpg",
      maxStock: product.quantity || 0,
    };
    
    await addToCart(cartItem);
    onAddToCart?.(cartItem);
    
    setIsAddingToCart(false);
  };
  
  const handleWishlist = async () => {
    await toggleWishlist(product.id);
  };
  
  // Variant-specific classes
  const variantClasses = {
    default: "bg-white rounded-lg shadow-md hover:shadow-xl",
    compact: "bg-white rounded-lg shadow-sm hover:shadow-md",
    featured: "bg-white rounded-xl shadow-lg hover:shadow-2xl border-2 border-blue-100",
  };
  
  const imageSizes = {
    default: "aspect-square",
    compact: "aspect-square",
    featured: "aspect-[4/3]",
  };
  
  return (
    <div className={cn("group relative overflow-hidden transition-all duration-300", variantClasses[variant])}>
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
          -{discount}%
        </div>
      )}
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-colors",
            isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
          )}
        />
      </button>
      
      {/* Quick View Button */}
      {showQuickView && (
        <button
          className="absolute top-2 right-12 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
          aria-label="Quick view"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      )}
      
      {/* Stock Overlay */}
      {stockStatus !== "IN_STOCK" && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <span className={cn(
            "text-white text-sm font-bold px-3 py-1 rounded-full",
            stockStatus === "LOW_STOCK" ? "bg-orange-500" : "bg-gray-800"
          )}>
            {stockStatus === "LOW_STOCK" ? "Low Stock!" : "Out of Stock"}
          </span>
        </div>
      )}
      
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <div className={cn("relative bg-gray-100", imageSizes[variant])}>
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-500 group-hover:scale-105",
                !isImageLoaded && "blur-sm"
              )}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
      {product.category && (
  <Link
    href={`/products?category=${product.category.slug}`}
    className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
  >
    {product.category.name}
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
        {product.averageRating !== undefined && product.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.averageRating || 0)
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
            ${(product.price || 0).toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > (product.price || 0) && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Stock Status Text */}
        {stockStatus === "LOW_STOCK" && (
          <p className="text-xs text-orange-600 mt-1">
            Only {product.quantity} left in stock
          </p>
        )}
        
        {/* Add to Cart Button */}
        {stockStatus !== "OUT_OF_STOCK" && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={cn(
              "mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all",
              variant === "compact" ? "text-sm" : "text-base",
              "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        )}
        
        {/* Out of Stock Message */}
        {stockStatus === "OUT_OF_STOCK" && (
          <button
            disabled
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-sm bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

// Helper functions with fallbacks
function getStockStatus(product: Product): StockStatus {
  if (!product) return "OUT_OF_STOCK";
  const inStock = product.inStock ?? (product.quantity > 0);
  if (!inStock) return "OUT_OF_STOCK";
  const threshold = product.lowStockThreshold ?? 5;
  if ((product.quantity ?? 0) <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

function calculateDiscount(product: Product): number {
  if (!product.comparePrice || product.comparePrice <= (product.price || 0)) return 0;
  return Math.round(((product.comparePrice - (product.price || 0)) / product.comparePrice) * 100);
}