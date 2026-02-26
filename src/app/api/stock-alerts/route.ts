import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { StockAlert } from "@/lib/models/stock-alert";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 stock alerts per minute per IP
    const { allowed } = rateLimit(`stock-alert:${getIP(req)}`, { limit: 5, windowSec: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { email, productId, productName } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: "Email and product ID required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    await connectDB();

    await StockAlert.findOneAndUpdate(
      { email, productId },
      { email, productId, productName, notified: false },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ success: true }); // Already subscribed
    }
    console.error("Stock alert error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to register alert" }, { status: 500 });
  }
}
