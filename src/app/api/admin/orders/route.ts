import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { validateEnum, ORDER_STATUSES, capInt } from "@/lib/validation";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/admin/orders
export async function GET(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = capInt(searchParams.get("page"), 1, 1, 1000);
    const limit = capInt(searchParams.get("limit"), 20, 1, 100);
    const statusRaw = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (statusRaw) {
      const validStatus = validateEnum(statusRaw, ORDER_STATUSES);
      if (!validStatus) {
        return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
      }
      filter.status = validStatus;
    }

    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { orderNumber: { $regex: escaped, $options: "i" } },
        { customerEmail: { $regex: escaped, $options: "i" } },
        { customerName: { $regex: escaped, $options: "i" } },
      ];
    }

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
    console.error("GET /api/admin/orders error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
