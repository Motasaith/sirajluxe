import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Ticket } from "@/lib/models";
import { rateLimit, getIP } from "@/lib/rate-limit";

// GET /api/tickets/[id] — fetch a single ticket (customer must own it)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const ticket = await Ticket.findOne({ _id: params.id, clerkUserId: userId }).lean();
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

// POST /api/tickets/[id] — customer replies to a ticket
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`tickets:reply:${userId}:${getIP(req)}`, { limit: 10, windowSec: 60 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const content = String(body.content || "").trim().slice(0, 5000);
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const ticket = await Ticket.findOneAndUpdate(
      { _id: params.id, clerkUserId: userId, status: { $nin: ["closed"] } },
      {
        $push: { messages: { sender: "customer", content } },
        $set: { status: "open" },
      },
      { new: true }
    );
    if (!ticket) return NextResponse.json({ error: "Ticket not found or closed" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("POST /api/tickets/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to reply" }, { status: 500 });
  }
}
