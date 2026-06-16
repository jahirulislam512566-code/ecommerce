"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import type { CategoryTree } from "@/types/category";

interface CategoryNavProps {
  variant?: "horizontal" | "vertical";
  showCount?: boolean;
  depth?: number;
}

export function CategoryNav({ variant = "horizontal", showCount = true, depth = 2 }: CategoryNavProps) {
  const pathname = usePathname();
  const { data: categories, isLoading } = useCategories({ tree: true, withCount: true });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (variant === "horizontal") {
    return (
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto space-x-6 py-3">
            <li>
              <Link
                href="/products"
                className={`text-sm whitespace-nowrap ${
                  pathname === "/products"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                All Products
              </Link>
            </li>
            {(categories as CategoryTree[]).map((category) => (
              <CategoryNavItem
                key={category.id}
                category={category}
                depth={0}
                maxDepth={depth}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => toggleExpand(category.id)}
                showCount={showCount}
              />
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <div className="space-y-1">
      {(categories as CategoryTree[]).map((category) => (
        <CategorySidebarItem
          key={category.id}
          category={category}
          depth={0}
          maxDepth={depth}
          isExpanded={expandedCategories.has(category.id)}
          onToggle={() => toggleExpand(category.id)}
          showCount={showCount}
        />
      ))}
    </div>
  );
}

// Horizontal Navigation Item with Dropdown
function CategoryNavItem({
  category,
  depth,
  maxDepth,
  isExpanded,
  onToggle,
  showCount,
}: {
  category: CategoryTree;
  depth: number;
  maxDepth: number;
  isExpanded: boolean;
  onToggle: () => void;
  showCount: boolean;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const pathname = usePathname();
  const isActive = pathname === `/products?category=${category.slug}`;

  if (depth >= maxDepth || !hasChildren) {
    return (
      <li className="relative group">
        <Link
          href={`/products?category=${category.slug}`}
          className={`text-sm whitespace-nowrap flex items-center gap-1 ${
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          {category.name}
          {showCount && category.productCount > 0 && (
            <span className="text-xs text-gray-400">({category.productCount})</span>
          )}
        </Link>
      </li>
    );
  }

  return (
    <li className="relative group">
      <button
        onClick={onToggle}
        className={`text-sm whitespace-nowrap flex items-center gap-1 ${
          isActive
            ? "text-blue-600 font-semibold"
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        {category.name}
        {showCount && category.productCount > 0 && (
          <span className="text-xs text-gray-400">({category.productCount})</span>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isExpanded && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-50">
          <div className="py-2">
            <Link
              href={`/products?category=${category.slug}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              All {category.name}
            </Link>
            <div className="border-t my-1" />
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/products?category=${child.slug}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {child.name}
                {showCount && child.productCount > 0 && (
                  <span className="text-xs text-gray-400 ml-1">({child.productCount})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

// Sidebar Navigation Item
function CategorySidebarItem({
  category,
  depth,
  maxDepth,
  isExpanded,
  onToggle,
  showCount,
}: {
  category: CategoryTree;
  depth: number;
  maxDepth: number;
  isExpanded: boolean;
  onToggle: () => void;
  showCount: boolean;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const pathname = usePathname();
  const isActive = pathname === `/products?category=${category.slug}`;
  const paddingLeft = depth * 16;

  return (
    <div>
      <div
        className="flex items-center justify-between py-2 rounded-lg hover:bg-gray-50"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <Link
          href={`/products?category=${category.slug}`}
          className={`flex-1 text-sm ${
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {category.name}
          {showCount && category.productCount > 0 && (
            <span className="text-xs text-gray-400 ml-1">({category.productCount})</span>
          )}
        </Link>
        
        {hasChildren && depth < maxDepth && (
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        )}
      </div>
      
      {isExpanded && hasChildren && depth < maxDepth && (
        <div className="mt-1 space-y-1">
          {category.children.map((child) => (
            <CategorySidebarItem
              key={child.id}
              category={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              isExpanded={false}
              onToggle={() => {}}
              showCount={showCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}