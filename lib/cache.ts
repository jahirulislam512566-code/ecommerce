import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const getCachedProducts = unstable_cache(
  async (filters: any) => {
    const products = await prisma.product.findMany({
      where: filters,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
    });
    return products;
  },
  ["products"],
  { revalidate: 3600, tags: ["products"] }
);

export const getCachedCategories = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });
    return categories;
  },
  ["categories"],
  { revalidate: 86400, tags: ["categories"] }
);

export const getCachedProduct = unstable_cache(
  async (slug: string) => {
    // Add validation for slug
    if (!slug) {
      return null;
    }
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
        category: true,
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        },
      },
    });
    
    return product;
  },
  ["product"],
  { revalidate: 3600, tags: ["product"] }
);