import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import { RecommendedProducts } from "@/components/products/recommended-products";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { SEO } from "@/components/seo/seo";

interface ProductPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// Helper function to safely convert Decimal to number
function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value?.toNumber) return value.toNumber();
  return Number(value);
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  if (!slug) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
  
  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE", visibility: "PUBLISHED" },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });
  
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const price = toNumber(product.price);
  
  return {
    title: `${product.name} | E-Store`,
    description: product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.slice(0, 160),
      images: primaryImage?.url,
      // Remove type: "product" - it's invalid
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  if (!slug) {
    notFound();
  }
  
  // Fetch product directly
  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE", visibility: "PUBLISHED" },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  
  if (!product) {
    notFound();
  }

  // Convert all Decimal values to numbers
  const transformedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: toNumber(product.price),
    comparePrice: product.comparePrice ? toNumber(product.comparePrice) : null,
    sku: product.sku,
    quantity: product.quantity,
    lowStockThreshold: product.lowStockThreshold,
    status: product.status,
    visibility: product.visibility,
    featured: product.featured,
    tags: product.tags,
    weight: product.weight,
    dimensions: product.dimensions,
    images: product.images.map(img => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      order: img.order,
    })),
    variants: product.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      attributes: v.attributes,
      price: v.price ? toNumber(v.price) : null,
      comparePrice: v.comparePrice ? toNumber(v.comparePrice) : null,
      quantity: v.quantity,
      image: v.image,
    })),
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    } : null,
    reviews: product.reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
      },
    })),
    averageRating: product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0,
    reviewCount: product.reviews.length,
    vendor: product.vendor,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    inStock: product.quantity > 0 || product.variants.some(v => v.quantity > 0),
  };

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
      visibility: "PUBLISHED",
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
    take: 4,
  });

  const transformedRelatedProducts = relatedProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: toNumber(p.price),
    comparePrice: p.comparePrice ? toNumber(p.comparePrice) : null,
    images: p.images,
    quantity: p.quantity,
    inStock: p.quantity > 0,
  }));

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: transformedProduct.name,
    description: transformedProduct.description,
    sku: transformedProduct.sku,
    offers: {
      "@type": "Offer",
      price: transformedProduct.price,
      priceCurrency: "USD",
      availability: transformedProduct.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: transformedProduct.averageRating,
      reviewCount: transformedProduct.reviewCount,
    },
  };

  return (
    <>
      <SEO
        title={`${transformedProduct.name} | E-Store`}
        description={transformedProduct.shortDescription || transformedProduct.description?.slice(0, 160)}
        image={transformedProduct.images[0]?.url}
        price={transformedProduct.price}
        availability={transformedProduct.inStock ? "in stock" : "out of stock"}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        <Suspense fallback={<div className="animate-pulse">Loading product...</div>}>
          <ProductDetailClient 
            initialProduct={transformedProduct} 
            relatedProducts={transformedRelatedProducts}
          />
        </Suspense>
      </div>
    </>
  );
}