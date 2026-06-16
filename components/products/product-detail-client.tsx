"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Star, Heart, Share2, Truck, RotateCcw, Shield, Minus, Plus, Check, X 
} from "lucide-react";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductReviews } from "./product-reviews";
import { RelatedProducts } from "./related-products";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

// Define proper types
interface Variant {
  id?: string;
  price?: number;
  comparePrice?: number;
  quantity?: number;
  sku?: string;
  name?: string;
  attributes?: Record<string, string>;
}

interface ProductDetailClientProps {
  initialProduct: any;
  relatedProducts: any[];
}

export function ProductDetailClient({ initialProduct, relatedProducts }: ProductDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Add check for initialProduct
  if (!initialProduct || !initialProduct.id) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Product not found</p>
      </div>
    );
  }

  const [product] = useState(initialProduct);
  // Remove setSelectedVariant since it's not used
  const [selectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "shipping">("description");

  // Check if product is in wishlist on load
  useEffect(() => {
    if (session && product?.id) {
      checkWishlistStatus();
    }
  }, [session, product?.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check?productId=${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.isWishlisted);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  // Get current price (variant price overrides product price) with proper null checks
  const currentPrice = selectedVariant?.price ?? product.price ?? 0;
  const currentComparePrice = selectedVariant?.comparePrice ?? product.comparePrice ?? 0;
  const currentStock = selectedVariant?.quantity ?? product.quantity ?? 0;
  
  const discount = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const isInStock = currentStock > 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch("/api/wishlist", {
        method: isWishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const getPrimaryImageUrl = () => {
    const primaryImage = product.images?.find((img: any) => img.isPrimary);
    return primaryImage?.url || product.images?.[0]?.url || "/placeholder.jpg";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Added to Cart Message */}
      {showAddedMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <Check className="w-5 h-5" />
          <span>Added to cart successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="sticky top-20 h-fit">
          <ProductImageGallery
            images={product.images || []}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.averageRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {(product.averageRating || 0).toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ${currentPrice.toFixed(2)}
              </span>
              {currentComparePrice > 0 && currentComparePrice > currentPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ${currentComparePrice.toFixed(2)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-green-600 text-sm mt-1">Save {discount}% today!</p>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-gray-600 mb-6 border-l-4 border-blue-500 pl-4">
              {product.shortDescription}
            </p>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= currentStock}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">{currentStock} units available</p>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {isInStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <X className="w-5 h-5" />
                <span>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              price={currentPrice}
              image={getPrimaryImageUrl()}
              maxStock={currentStock}
              quantity={quantity}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
              onSuccess={() => {
                setShowAddedMessage(true);
                setTimeout(() => setShowAddedMessage(false), 3000);
              }}
            />
            
            <button
              onClick={handleWishlist}
              className="px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </button>
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                }
              }}
              className="px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Free Delivery</p>
                <p className="text-sm text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">30-Day Returns</p>
                <p className="text-sm text-gray-500">Hassle-free returns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Warranty</p>
                <p className="text-sm text-gray-500">1 year warranty included</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <div className="border-b">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "description"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "reviews"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Reviews ({product.reviewCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "shipping"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shipping Info
            </button>
          </div>
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description || "" }} />
              {product.tags?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <ProductReviews
              productId={product.id}
              initialReviews={product.reviews}
              averageRating={product.averageRating || 0}
              reviewCount={product.reviewCount || 0}
            />
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Shipping Information</h3>
              <p>Free shipping on orders over $50. Estimated delivery: 3-5 business days.</p>
              <h3 className="font-semibold text-lg">Returns Policy</h3>
              <p>30-day return policy. Items must be unused and in original packaging.</p>
              {product.weight && (
                <p className="text-sm text-gray-500">Shipping weight: {product.weight} kg</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}