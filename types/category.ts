// types/category.ts

import type { Product } from './product';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Make productCount required since it's the main difference
export interface CategoryWithCount extends Category {
  productCount: number; // Override to make it required
  subcategories?: CategoryWithCount[];
}

export interface CategoryTree extends Category {
  children: CategoryTree[]; // Override to make it required
  productCount: number; // Override to make it required
  level: number;
}

// If you need a partial category (for forms, etc.)
export type CategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & {
  parentId?: string | null;
};

// For category creation
export type CreateCategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
};

// For category update
export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  id: string;
};

// Category list response
export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
}

// Category tree response with nested structure
export interface CategoryTreeResponse {
  trees: CategoryTree[];
  totalCategories: number;
}

// Category filter options
export interface CategoryFilterOptions {
  includeProducts?: boolean;
  includeSubcategories?: boolean;
  maxDepth?: number;
  sortBy?: 'name' | 'productCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Category navigation item for UI
export interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  icon?: string;
  children?: CategoryNavItem[];
  isActive?: boolean;
}

// Helper function to check if category has children
export const hasChildren = (category: Category): boolean => {
  return !!(category.children && category.children.length > 0);
};

// Helper to get full category path
export const getCategoryPath = (category: Category, allCategories: Category[]): string => {
  const path: string[] = [category.slug];
  let current: Category | undefined = category;
  
  while (current?.parentId) {
    const parent = allCategories.find(c => c.id === current?.parentId);
    if (parent) {
      path.unshift(parent.slug);
      current = parent;
    } else {
      break;
    }
  }
  
  return path.join('/');
};

// Helper to build category tree from flat list
export const buildCategoryTree = (
  categories: CategoryWithCount[],
  parentId: string | null = null
): CategoryTree[] => {
  const filtered = categories.filter(c => c.parentId === parentId);
  
  return filtered.map(category => ({
    ...category,
    productCount: category.productCount || 0,
    level: 0, // Will be updated recursively
    children: buildCategoryTree(categories, category.id),
  }));
};

// Helper to flatten category tree
export const flattenCategoryTree = (tree: CategoryTree[]): Category[] => {
  const result: Category[] = [];
  
  const traverse = (nodes: CategoryTree[]) => {
    for (const node of nodes) {
      const { children, ...rest } = node;
      result.push(rest);
      if (children && children.length > 0) {
        traverse(children);
      }
    }
  };
  
  traverse(tree);
  return result;
};