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
      // Fixed: Dynamically build query args to satisfy exactOptionalPropertyTypes
      const queryArgs: any = {
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
      };

      // Only attach the where filter if it's explicitly needed
      if (parentOnly) {
        queryArgs.where = { parentId: null };
      }

      categories = await prisma.category.findMany(queryArgs);
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

// Helper function to turn flat database rows into a nested tree structure
function buildCategoryTree(nodes: any[]): any[] {
  const map: { [key: string]: any } = {};
  const roots: any[] = [];

  // Step 1: Map all nodes by their IDs and initialize an empty array for their children
  for (const node of nodes) {
    map[node.id] = { ...node, children: [] };
  }

  // Step 2: Tie child items directly to their designated parent nodes or push them to the roots list
  for (const node of nodes) {
    const mappedNode = map[node.id];
    if (node.parentId && map[node.parentId]) {
      map[node.parentId].children.push(mappedNode);
    } else {
      roots.push(mappedNode);
    }
  }

  return roots;
}