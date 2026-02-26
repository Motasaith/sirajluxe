import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/lib/models";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/products — public product listing
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 100);
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured");
    const slug = searchParams.get("slug") || "";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (slug) filter.slug = slug;
    if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortQuery: any = { createdAt: -1 };
    switch (sort) {
      case "price-asc": sortQuery = { price: 1 }; break;
      case "price-desc": sortQuery = { price: -1 }; break;
      case "rating": sortQuery = { rating: -1 }; break;
      case "name-asc": sortQuery = { name: 1 }; break;
      case "name-desc": sortQuery = { name: -1 }; break;
      default: sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      docs: products.map((p) => ({
        ...p,
        id: p._id.toString(),
        tags: (p.tags || []).map((t: string) => ({ tag: t })),
        colors: (p.colors || []).map((c: string) => ({ color: c })),
        sizes: (p.sizes || []).map((s: string) => ({ size: s })),
        images: (p.images || []).map((url: string) => ({ url })),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/products error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
