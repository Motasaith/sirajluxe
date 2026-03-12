import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BlogPost } from "@/lib/models";
import { capInt } from "@/lib/validation";

// GET /api/blog — list published blog posts
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = capInt(searchParams.get("limit"), 50, 1, 100);
    const page = capInt(searchParams.get("page"), 1, 1, 1000);
    const skip = (page - 1) * limit;

    const now = new Date();
    const filter: Record<string, unknown> = {
      published: true,
      $or: [
        { scheduledAt: null },
        { scheduledAt: { $exists: false } },
        { scheduledAt: { $lte: now } },
      ],
    };
    if (category && category !== "All") filter.category = category;

    const [docs, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content")
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return NextResponse.json({
      docs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/blog error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
