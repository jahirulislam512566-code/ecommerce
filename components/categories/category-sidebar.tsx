"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/use-categories";
import { ChevronRight } from "lucide-react";

export function CategorySidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  
  const { data: categories, isLoading } = useCategories({ withCount: true });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Categories</h3>
      <div className="space-y-2">
        <Link
          href="/products"
          className={`flex items-center justify-between text-sm py-1 ${
            !currentCategory
              ? "text-blue-600 font-medium"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <span>All Products</span>
        </Link>
        
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className={`flex items-center justify-between text-sm py-1 ${
              currentCategory === category.slug
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span>{category.name}</span>
            {category.productCount > 0 && (
              <span className="text-xs text-gray-400">({category.productCount})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}