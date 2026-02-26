import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-logger";

// GET /api/admin/products/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const product = await Product.findById(params.id).lean();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ ...product, id: product._id.toString() });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    const { name, slug, description, price, originalPrice, category, tags, inStock, featured, image, images, colors, sizes, sku, inventory, metaTitle, metaDescription } = body;
    const product = await Product.findByIdAndUpdate(params.id, { name, slug, description, price, originalPrice, category, tags, inStock, featured, image, images, colors, sizes, sku, inventory, metaTitle, metaDescription }, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    await logActivity({ action: "update", entity: "product", entityId: params.id, details: `Updated product: ${product.name}` });
    return NextResponse.json({ ...product, id: product._id.toString() });
  } catch (error: unknown) {
    console.error("PUT /api/admin/products/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    await logActivity({ action: "delete", entity: "product", entityId: params.id, details: `Deleted product: ${product.name}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
