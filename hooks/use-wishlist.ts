"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: { url: string; altText: string | null; isPrimary: boolean }[];
  };
  createdAt: string;
}

async function fetchWishlist(): Promise<WishlistItem[]> {
  const response = await fetch("/api/wishlist");
  if (!response.ok) throw new Error("Failed to fetch wishlist");
  const data = await response.json();
  return data.items;
}

async function addToWishlist(productId: string): Promise<void> {
  const response = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!response.ok) throw new Error("Failed to add to wishlist");
}

async function removeFromWishlist(productId: string): Promise<void> {
  const response = await fetch(`/api/wishlist?productId=${productId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to remove from wishlist");
}

export function useWishlist() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeMutation.mutateAsync(productId);
    } else {
      await addMutation.mutateAsync(productId);
    }
  };

  return {
    wishlist,
    isLoading,
    isInWishlist,
    toggleWishlist,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}