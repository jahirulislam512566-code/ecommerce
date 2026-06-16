import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest, // Fixed: Added underscore for unused variable
  { params }: { params: Promise<{ slug: string }> } // Fixed: Typed as Promise for Next.js compatibility
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        products: {
          where: { status: "ACTIVE", visibility: "PUBLISHED" },
          take: 20,
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
                },
              },
            },
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Transform product prices
    const transformedCategory = {
      ...category,
      products: category.products.map((product) => ({
        ...product,
        price: product.price.toNumber(),
        comparePrice: product.comparePrice?.toNumber() || null,
      })),
    };

    return NextResponse.json({
      success: true,
      category: transformedCategory,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, // Used here because we access request.json()
  { params }: { params: Promise<{ slug: string }> } // Fixed: Typed as Promise
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const body = await request.json();
    const { name, description, image, parentId } = body;

    const category = await prisma.category.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest, // Fixed: Added underscore for unused variable
  { params }: { params: Promise<{ slug: string }> } // Fixed: Typed as Promise
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete category with products. Move or delete products first." 
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { slug },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}