"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/use-categories";

// Define proper types for category
interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export function CategorySidebar() {
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

  // Function to build category URL with preserved query params
  const buildCategoryUrl = (slug: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    
    // Preserve other query params like search, sort, etc.
    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Categories</h3>
      <div className="space-y-2">
        <Link
          href={buildCategoryUrl(null)}
          className={`flex items-center justify-between text-sm py-1 rounded-md px-2 transition-colors ${
            !currentCategory
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
          }`}
        >
          <span>All Products</span>
        </Link>
        
        {categories.map((category: Category) => (
          <Link
            key={category.id}
            href={buildCategoryUrl(category.slug)}
            className={`flex items-center justify-between text-sm py-1 rounded-md px-2 transition-colors ${
              currentCategory === category.slug
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            <span>{category.name}</span>
            {category.productCount !== undefined && category.productCount > 0 && (
              <span className="text-xs text-gray-400">({category.productCount})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}