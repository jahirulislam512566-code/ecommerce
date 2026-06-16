import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estore.com";

  // Static routes
  const staticRoutes = [
    { url: baseUrl, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, priority: 0.6, changeFrequency: "monthly" as const },
  ];

  // Dynamic product routes
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", visibility: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  // Dynamic category routes
  const categories = await prisma.category.findMany({
    where: { products: { some: {} } },
    select: { slug: true },
  });

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    priority: 0.7,
    changeFrequency: "daily" as const,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}