import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { capInt } from "@/lib/validation";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/admin/products — list all products
export async function GET(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = capInt(searchParams.get("page"), 1, 1, 1000);
    const limit = capInt(searchParams.get("limit"), 20, 1, 100);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      docs: products.map((p) => ({ ...p, id: p._id.toString() })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/admin/products — create product
export async function POST(req: NextRequest) {
  const denied = await adminGuard("admin"); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    const { name, slug, description, price, originalPrice, category, tags, inStock, featured, image, images, colors, sizes, sku, inventory, variants, metaTitle, metaDescription } = body;
    const product = await Product.create({ name, slug, description, price, originalPrice, category, tags, inStock, featured, image, images, colors, sizes, sku, inventory, variants: variants || [], metaTitle, metaDescription });
    return NextResponse.json({ ...product.toObject(), id: product._id.toString() }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/products error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
