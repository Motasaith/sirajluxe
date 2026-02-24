import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/lib/models";

// GET /api/products — public product listing
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured");
    const slug = searchParams.get("slug") || "";
    const search = searchParams.get("search") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (slug) filter.slug = slug;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    return NextResponse.json({
      docs: products.map((p) => ({
        ...p,
        id: p._id.toString(),
        tags: (p.tags || []).map((t: string) => ({ tag: t })),
        colors: (p.colors || []).map((c: string) => ({ color: c })),
        sizes: (p.sizes || []).map((s: string) => ({ size: s })),
        images: (p.images || []).map((url: string) => ({ url })),
      })),
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
