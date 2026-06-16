import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeProducts = searchParams.get("includeProducts") === "true";
    const withCount = searchParams.get("withCount") === "true";
    const parentOnly = searchParams.get("parentOnly") === "true";
    const tree = searchParams.get("tree") === "true";

    let categories;

    if (tree) {
      // Get hierarchical category tree
      const allCategories = await prisma.category.findMany({
        include: {
          children: true,
          ...(includeProducts && {
            products: {
              where: { status: "ACTIVE", visibility: "PUBLISHED" },
              take: 10,
            },
          }),
        },
      });
      
      categories = buildCategoryTree(allCategories);
    } else {
      // Get flat categories
      categories = await prisma.category.findMany({
        where: parentOnly ? { parentId: null } : undefined,
        include: {
          children: true,
          ...(includeProducts && {
            products: {
              where: { status: "ACTIVE", visibility: "PUBLISHED" },
              take: 10,
            },
          }),
        },
        orderBy: { name: "asc" },
      });
    }

    // Add product count if requested
    let result = categories;
    if (withCount) {
      const categoriesWithCount = await Promise.all(
        (Array.isArray(categories) ? categories : []).map(async (category) => {
          const count = await prisma.product.count({
            where: {
              categoryId: category.id,
              status: "ACTIVE",
              visibility: "PUBLISHED",
            },
          });
          return { ...category, productCount: count };
        })
      );
      result = categoriesWithCount;
    }

    return NextResponse.json({
      success: true,
      categories: result,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image, parentId } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { OR: [{ slug }, { name }] },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this name or slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}