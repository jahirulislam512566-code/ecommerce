"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import type { Product, CartItem } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (item: CartItem) => void;
  variant?: "default" | "compact" | "featured";
  showQuickView?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  variant = "default",
  showQuickView = true 
}: ProductCardProps) {
  // Option 1: Remove type annotation entirely (TypeScript will infer)
  const addToCart = useCartStore((state) => state.addItem);
  
  // OR Option 2: Use 'any' if you want to be explicit
  // const addToCart = useCartStore((state: any) => state.addItem);
  
  // OR Option 3: Import the type if available
  // import type { CartStore } from "@/stores/cartStore";
  // const addToCart = useCartStore((state: CartStore) => state.addItem);
  
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isWishlisted = isInWishlist(product.id);

  // Memoized dynamic stock calculations
  const stockStatus = useMemo(() => {
    if (!product) return "OUT_OF_STOCK";
    const quantity = (product as any).quantity ?? 0;
    const inStock = (product as any).inStock ?? (quantity > 0);
    if (!inStock) return "OUT_OF_STOCK";
    const threshold = (product as any).lowStockThreshold ?? 5;
    if (quantity <= threshold) return "LOW_STOCK";
    return "IN_STOCK";
  }, [product]);

  // Memoized calculated discount rate
  const discount = useMemo(() => {
    if (!product.comparePrice || product.comparePrice <= (product.price || 0)) return 0;
    return Math.round(((product.comparePrice - (product.price || 0)) / product.comparePrice) * 100);
  }, [product]);

  // Fallback engine filtering to extract main display image
  const primaryImage = useMemo(() => {
    return product.images?.find(img => img.isPrimary) || product.images?.[0];
  }, [product]);
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    const cartItem: CartItem = {
      id: String(product.id), 
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: 1,
      image: primaryImage?.url || "/placeholder.jpg",
      maxStock: (product as any).quantity || 0,
    };
    
    try {
      await addToCart(cartItem);
      onAddToCart?.(cartItem);
    } catch (err) {
      console.error("Cart system exception handling triggered:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Your QuickView modal trigger logic goes here
  };
  
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
    <div className={cn("group relative flex flex-col justify-between overflow-hidden transition-all duration-300 h-full", variantClasses[variant])}>
      
      {/* Visual Anchor Frame Wrapper */}
      <div className="relative w-full">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md pointer-events-none">
            -{discount}%
          </div>
        )}
        
        {/* Action Controls */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-all md:opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </button>
          
          {showQuickView && (
            <button
              onClick={handleQuickView}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-all md:opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Stock Overlay */}
        {stockStatus === "OUT_OF_STOCK" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-white text-xs font-bold px-3 py-1 rounded-full bg-gray-900/90 tracking-wide uppercase">
              Out of Stock
            </span>
          </div>
        )}
        
        {/* Product Image Link Container */}
        <Link href={`/product/${product.slug}`} className="block overflow-hidden">
          <div className={cn("relative bg-gray-100 w-full overflow-hidden", imageSizes[variant])}>
            {primaryImage && !imageError ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-all duration-500 group-hover:scale-105",
                  !isImageLoaded ? "blur-md scale-105 bg-gray-200" : "blur-0 scale-100"
                )}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setImageError(true)}
                priority={variant === "featured"}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-400">No image available</span>
              </div>
            )}
          </div>
        </Link>
      </div>
      
      {/* Product Content Details Block */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className={cn(
              "mt-1 font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2",
              variant === "compact" ? "text-sm h-10" : "text-base h-12"
            )}>
              {product.name}
            </h3>
          </Link>
          
          {/* Rating Block */}
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
        </div>

        <div className="mt-4">
          {/* Price Metrics Layer */}
          <div className="flex items-baseline gap-2 flex-wrap">
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
          
          {/* Stock Notification Text */}
          {stockStatus === "LOW_STOCK" && (
            <p className="text-xs font-medium text-orange-600 mt-1">
              Only {(product as any).quantity} left in stock
            </p>
          )}
          
          {/* Interactive Button CTA Actions */}
          {stockStatus !== "OUT_OF_STOCK" ? (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={cn(
                "mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all active:scale-[0.98]",
                variant === "compact" ? "text-sm" : "text-base",
                "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          ) : (
            <button
              disabled
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-sm bg-gray-100 text-gray-400 cursor-not-allowed border"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}