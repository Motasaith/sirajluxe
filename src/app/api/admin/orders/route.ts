import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/orders
export async function GET(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      docs: orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
