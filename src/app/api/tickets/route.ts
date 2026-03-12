import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Ticket } from "@/lib/models";
import { rateLimit, getIP } from "@/lib/rate-limit";

function genTicketNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TKT-${ts}-${rand}`;
}

// GET /api/tickets — list the signed-in customer's own tickets
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const tickets = await Ticket.find({ clerkUserId: userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST /api/tickets — create a new ticket
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`tickets:create:${userId}:${getIP(req)}`, { limit: 5, windowSec: 60 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    await connectDB();
    const user = await currentUser();
    const body = await req.json();

    const subject = String(body.subject || "").trim().slice(0, 200);
    const message = String(body.message || "").trim().slice(0, 5000);
    const category = ["order", "product", "shipping", "return", "payment", "other"].includes(body.category)
      ? body.category
      : "other";
    const orderId = String(body.orderId || "").trim().slice(0, 50);

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const customerName =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Customer";
    const customerEmail =
      user?.emailAddresses?.[0]?.emailAddress || "";

    const ticket = await Ticket.create({
      ticketNumber: genTicketNumber(),
      clerkUserId: userId,
      customerEmail,
      customerName,
      subject,
      category,
      orderId,
      status: "open",
      priority: "medium",
      messages: [{ sender: "customer", content: message }],
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
