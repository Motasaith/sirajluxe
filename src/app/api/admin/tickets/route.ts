import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Ticket } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/tickets — list all tickets with optional filters
export async function GET(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;

  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    return NextResponse.json({ tickets, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/admin/tickets error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
