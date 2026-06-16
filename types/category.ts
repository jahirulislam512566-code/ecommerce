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

export interface CategoryWithCount extends Category {
  productCount: number;
  subcategories?: CategoryWithCount[];
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  productCount: number;
  level: number;
}