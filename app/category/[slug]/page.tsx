import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { CategoryBreadcrumb } from "@/components/categories/category-breadcrumb";
import { Metadata } from "next";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} | E-Store`,
    description: category.description || `Shop ${category.name} products at E-Store`,
    openGraph: {
      title: category.name,
      description: category.description || `Shop ${category.name} products`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      parent: true,
      children: {
        include: {
          _count: {
            select: { products: true },
          },
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Get products in this category
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        categoryId: category.id,
        status: "ACTIVE",
        visibility: "PUBLISHED",
      },
      skip,
      take: limit,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({
      where: {
        categoryId: category.id,
        status: "ACTIVE",
        visibility: "PUBLISHED",
      },
    }),
  ]);

  const transformedProducts = products.map((product) => ({
    ...product,
    price: product.price.toNumber(),
    comparePrice: product.comparePrice?.toNumber() || null,
    inStock: product.quantity > 0,
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <CategoryBreadcrumb categoryId={category.id} />

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">{totalCount} products</p>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subcategories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {category.children.map((sub) => (
              <a
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900">{sub.name}</h3>
                <p className="text-sm text-gray-500">{sub._count.products} products</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {transformedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {transformedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <a
                  href={`/category/${category.slug}?page=${page - 1}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Previous
                </a>
              )}
              <span className="px-4 py-2 text-gray-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/category/${category.slug}?page=${page + 1}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}