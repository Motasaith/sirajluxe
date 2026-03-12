import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Ticket } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/tickets/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    await connectDB();
    const ticket = await Ticket.findById(params.id).lean();
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("GET /api/admin/tickets/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

// PATCH /api/admin/tickets/[id] — update status/priority
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    await connectDB();
    const body = await req.json();
    const update: Record<string, unknown> = {};

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    const validPriorities = ["low", "medium", "high"];

    if (body.status && validStatuses.includes(body.status)) update.status = body.status;
    if (body.priority && validPriorities.includes(body.priority)) update.priority = body.priority;

    const ticket = await Ticket.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true }
    );
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("PATCH /api/admin/tickets/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

// POST /api/admin/tickets/[id] — admin reply
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    await connectDB();
    const body = await req.json();
    const content = String(body.content || "").trim().slice(0, 5000);
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const ticket = await Ticket.findByIdAndUpdate(
      params.id,
      {
        $push: { messages: { sender: "admin", content } },
        $set: { status: "in_progress" },
      },
      { new: true }
    );
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("POST /api/admin/tickets/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to reply" }, { status: 500 });
  }
}
