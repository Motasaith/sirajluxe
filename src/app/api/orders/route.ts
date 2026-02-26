import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { validateEnum, ORDER_STATUSES, capInt } from "@/lib/validation";

// GET /api/orders — list orders for current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const statusRaw = searchParams.get("status");
    const page = capInt(searchParams.get("page"), 1, 1, 1000);
    const limit = capInt(searchParams.get("limit"), 20, 1, 100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { clerkUserId: userId };
    if (statusRaw) {
      const validStatus = validateEnum(statusRaw, ORDER_STATUSES);
      if (validStatus) filter.status = validStatus;
    }

    const total = await Order.countDocuments(filter);
    const docs = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      orders: docs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}


