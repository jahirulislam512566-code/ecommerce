// lib/cache/products.ts
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getCachedProducts = unstable_cache(
  async (filters: any) => {
    const products = await prisma.product.findMany({
      where: filters,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
        variants: { select: { id: true, attributes: true, quantity: true, price: true } },
      },
    });
    return products;
  },
  ["products"],
  { revalidate: 3600, tags: ["products"] }
);