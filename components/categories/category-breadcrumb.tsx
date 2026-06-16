import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBreadcrumbPath } from "@/lib/category-utils";

interface CategoryBreadcrumbProps {
  categoryId: string;
}

export async function CategoryBreadcrumb({ categoryId }: CategoryBreadcrumbProps) {
  // Get all categories for breadcrumb building
  const allCategories = await prisma.category.findMany();
  const breadcrumbPath = getBreadcrumbPath(allCategories, categoryId);

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link href="/" className="text-gray-500 hover:text-blue-600">
        <Home className="w-4 h-4" />
      </Link>
      <ChevronRight className="w-3 h-3 text-gray-400" />
      <Link href="/products" className="text-gray-500 hover:text-blue-600">
        All Products
      </Link>
      
      {breadcrumbPath.map((category, index) => (
        <div key={category.id} className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-gray-400" />
          {index === breadcrumbPath.length - 1 ? (
            <span className="text-gray-900 font-medium">{category.name}</span>
          ) : (
            <Link
              href={`/category/${category.slug}`}
              className="text-gray-500 hover:text-blue-600"
            >
              {category.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}