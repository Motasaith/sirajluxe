import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Category } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { isValidObjectId } from "@/lib/validation";

// GET /api/admin/categories
export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json({ docs: categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    // Whitelist allowed fields only
    const { name, slug, description, image } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    const category = await Category.create({ name, slug, description, image });
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/categories error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// DELETE /api/admin/categories
export async function DELETE(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const { id } = await req.json();
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/categories error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

// PUT /api/admin/categories — update category
export async function PUT(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, description } = body;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const updated = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/categories error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}
