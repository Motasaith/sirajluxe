import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product, Category } from "@/lib/models";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — dashboard statistics
export async function GET() {
  try {
    await connectDB();

    const [productCount, categoryCount] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments({ isActive: true }),
    ]);

    return NextResponse.json({
      products: productCount,
      categories: categoryCount,
    });
  } catch (error) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
