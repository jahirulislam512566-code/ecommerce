"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({ productId, className = "", size = "md" }: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();
  
  const isWishlisted = isInWishlist(productId);
  const isLoading = isAdding || isRemoving;

  const handleClick = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    await toggleWishlist(productId);
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`${iconSizes[size]} transition-colors ${
          isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
    </button>
  );
}