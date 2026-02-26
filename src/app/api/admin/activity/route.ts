import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ActivityLog } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/activity — list recent activity
export async function GET(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const entity = searchParams.get("entity") || "";

    const filter: Record<string, unknown> = {};
    if (entity) filter.entity = entity;

    const [docs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      docs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/activity error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
