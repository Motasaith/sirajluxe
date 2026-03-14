import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rate-limit";
import connectDB from "@/lib/mongodb";
import { Subscriber } from "@/lib/models/subscriber";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 signups per minute per IP
    const { allowed } = rateLimit(`newsletter:${getIP(req)}`, { limit: 3, windowSec: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Always persist locally in MongoDB
    await connectDB();
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        existing.unsubscribedAt = undefined;
        existing.subscribedAt = new Date();
        await existing.save();
      }
      // Already subscribed — still return success
    } else {
      await Subscriber.create({
        email: email.toLowerCase(),
        status: "active",
        source: "footer",
      });
    }

    // Optionally sync to Resend Audience if configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
    if (RESEND_API_KEY && RESEND_AUDIENCE_ID) {
      try {
        const res = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            unsubscribed: false,
          }),
        });

        if (!res.ok && res.status !== 204) {
          const data = await res.json().catch(() => ({}));
          console.error("Resend API error:", typeof data === "object" ? JSON.stringify(data).slice(0, 200) : "Unknown");
        }
      } catch (resendErr) {
        console.error("Resend sync failed:", resendErr instanceof Error ? resendErr.message : "Unknown");
        // Don't fail the request — local save succeeded
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
