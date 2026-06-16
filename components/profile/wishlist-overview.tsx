"use client";

import { useEffect, useState, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, ShoppingCart, Trash2, AlertCircle } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string; // FIX: Fallback type configuration for database parsing
    comparePrice: number | string | null;
    quantity: number;
    images: { url: string; altText: string | null; isPrimary: boolean }[];
  };
  createdAt: string;
}

export function WishlistOverview() {
  const { data: session } = useSession();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    // FIX: Integrated AbortController to handle Next.js development double-rendering safely
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchWishlist = async () => {
      try {
        setError(null);
        const response = await fetch("/api/wishlist", { signal });
        if (!response.ok) throw new Error("Failed to fetch wishlist");
        const data = await response.json();
        
        if (!signal.aborted) {
          setWishlistItems(data.items || []);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error fetching wishlist:", err);
          setError("Failed to load wishlist. Please try again.");
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchWishlist();

    return () => {
      controller.abort();
    };
  }, [session]);

  const handleRemoveFromWishlist = async (itemId: string, productId: string) => {
    setIsRemoving(itemId);
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to remove from wishlist");
      
      // FIX: Ensure correct correlation tracking across both itemId and productId bounds
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
    const numericPrice = typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price;
    
    await addToCart({
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: numericPrice,
      image: primaryImage?.url || "/placeholder.jpg",
      quantity: 1,
      maxStock: item.product.quantity,
    });
  };

  // FIX: Process batch array items concurrently to avoid event-loop blocking
  const handleMoveAllToCart = async () => {
    const availableItems = wishlistItems.filter(item => item.product.quantity > 0);
    await Promise.all(availableItems.map(item => handleAddToCart(item)));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4 p-4 border rounded-lg">
              <div className="w-24 h-24 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Wishlist</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-6">Save your favorite items here</p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Wishlist</h2>
        <button
          onClick={handleMoveAllToCart}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <ShoppingCart className="w-4 h-4" />
          Move All to Cart
        </button>
      </div>

      <div className="space-y-4">
        {wishlistItems.map((item) => {
          const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
          
          // FIX: Defensive parsing checks to prevent execution errors if inputs arrive as strings
          const currentPrice = typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price;
          const trackingPrice = item.product.comparePrice ? (typeof item.product.comparePrice === "string" ? parseFloat(item.product.comparePrice) : item.product.comparePrice) : null;
          
          const discount = trackingPrice && trackingPrice > currentPrice
            ? Math.round(((trackingPrice - currentPrice) / trackingPrice) * 100)
            : 0;
          const isInStock = item.product.quantity > 0;

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <Link
                href={`/product/${item.product.slug}`}
                className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
              >
                {primaryImage && (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.altText || item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </Link>

              {/* Product Info */}
              <div className="flex-1">
                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {trackingPrice && trackingPrice > currentPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ${trackingPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-green-600">Save {discount}%</span>
                    </>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mt-2">
                  {isInStock ? (
                    <span className="text-sm text-green-600">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!isInStock}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id, item.productId)}
                    disabled={isRemoving === item.id}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isRemoving === item.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>

              {/* Date Added */}
              <div className="text-sm text-gray-500 whitespace-nowrap">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}