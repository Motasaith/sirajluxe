import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Category, Product } from "@/lib/models";

// GET /api/categories — public generic categories list
export async function GET() {
  try {
    await connectDB();
    const docs = await Category.find().sort({ createdAt: 1 }).lean();
    
    // As a bonus effect, if frontend needs product counts per category:
    // We can fetch category counts from the Product model
    const countsAggr = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const countMap = countsAggr.reduce((acc: Record<string, number>, curr: { _id: string; count: number }) => {
      if (curr._id) acc[curr._id] = curr.count;
      return acc;
    }, {});

    const enrichedDocs = docs.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      productCount: countMap[doc.name] || 0
    }));

    return NextResponse.json({ docs: enrichedDocs });
  } catch (error) {
    console.error("GET /api/categories error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
