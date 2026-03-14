import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Subscriber } from "@/lib/models/subscriber";
import { adminGuard } from "@/lib/admin-auth";
import nodemailer from "nodemailer";

// GET /api/admin/newsletter — list all subscribers + stats
export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await connectDB();
    const subscribers = await Subscriber.find()
      .sort({ subscribedAt: -1 })
      .lean();

    const active = subscribers.filter((s) => s.status === "active");
    const unsubscribed = subscribers.filter((s) => s.status === "unsubscribed");

    return NextResponse.json({
      subscribers: subscribers.map((s) => ({
        _id: s._id.toString(),
        email: s.email,
        status: s.status,
        source: s.source,
        subscribedAt: s.subscribedAt,
        unsubscribedAt: s.unsubscribedAt,
      })),
      stats: {
        total: subscribers.length,
        active: active.length,
        unsubscribed: unsubscribed.length,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/newsletter error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

// POST /api/admin/newsletter — send a newsletter to all active subscribers
export async function POST(req: NextRequest) {
  const guard = await adminGuard("editor");
  if (guard) return guard;

  try {
    const { subject, htmlContent, textContent } = await req.json();

    if (!subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!htmlContent?.trim() && !textContent?.trim()) {
      return NextResponse.json({ error: "Email body is required" }, { status: 400 });
    }

    await connectDB();
    const activeSubscribers = await Subscriber.find({ status: "active" }).lean();

    if (activeSubscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const fromName = process.env.EMAIL_FROM_NAME || "Siraj Luxe";
    const fromEmail = process.env.EMAIL_FROM || "noreply@sirajluxe.com";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.resend.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY || process.env.SMTP_PASS,
      },
    });

    let sent = 0;
    let failed = 0;

    // Send in batches of 10 to avoid SMTP rate limits
    const batchSize = 10;
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((sub) => {
          const unsubLink = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}`;
          const footer = `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #333;font-size:12px;color:#888;text-align:center;"><a href="${unsubLink}" style="color:#8b5cf6;">Unsubscribe</a> | <a href="${siteUrl}" style="color:#8b5cf6;">Visit Store</a></div>`;

          return transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: sub.email,
            subject: subject.trim(),
            text: (textContent || "").trim() + `\n\nUnsubscribe: ${unsubLink}`,
            html: wrapEmailTemplate(subject.trim(), (htmlContent || "").trim() + footer),
          });
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") sent++;
        else failed++;
      }
    }

    return NextResponse.json({
      message: `Newsletter sent to ${sent} subscriber${sent !== 1 ? "s" : ""}${failed > 0 ? ` (${failed} failed)` : ""}`,
      sent,
      failed,
      total: activeSubscribers.length,
    });
  } catch (error) {
    console.error("POST /api/admin/newsletter error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}

// DELETE /api/admin/newsletter — remove a subscriber
export async function DELETE(req: NextRequest) {
  const guard = await adminGuard("editor");
  if (guard) return guard;

  try {
    const url = new URL(req.url);
    const subscriberId = url.searchParams.get("id");
    if (!subscriberId) {
      return NextResponse.json({ error: "Subscriber ID required" }, { status: 400 });
    }

    await connectDB();
    const sub = await Subscriber.findByIdAndDelete(subscriberId);
    if (!sub) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subscriber removed" });
  } catch (error) {
    console.error("DELETE /api/admin/newsletter error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}

function wrapEmailTemplate(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);line-height:48px;text-align:center;">
        <span style="color:#fff;font-size:20px;font-weight:800;">SL</span>
      </div>
    </div>
    <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
      <h1 style="color:#fff;font-size:22px;margin:0 0 20px;">${subject}</h1>
      <div style="color:#d1d5db;font-size:15px;line-height:1.7;">${body}</div>
    </div>
    <p style="text-align:center;margin-top:24px;font-size:12px;color:#555;">© ${new Date().getFullYear()} Siraj Luxe. All rights reserved.</p>
  </div>
</body>
</html>`;
}
