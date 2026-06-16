import type { Category, CategoryTree } from "@/types/category";

export function buildCategoryTree(
  categories: any[],
  parentId: string | null = null,
  level: number = 0
): CategoryTree[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      level,
      children: buildCategoryTree(categories, category.id, level + 1),
      productCount: category._count?.products || 0,
    }));
}

export function getBreadcrumbPath(
  categories: Category[],
  currentCategoryId: string
): Category[] {
  const path: Category[] = [];
  let currentId = currentCategoryId;

  while (currentId) {
    const category = categories.find((c) => c.id === currentId);
    if (!category) break;
    path.unshift(category);
    currentId = category.parentId || "";
  }

  return path;
}

export function flattenCategoryTree(categories: CategoryTree[]): Category[] {
  const result: Category[] = [];
  
  for (const category of categories) {
    result.push(category);
    if (category.children && category.children.length > 0) {
      result.push(...flattenCategoryTree(category.children));
    }
  }
  
  return result;
}