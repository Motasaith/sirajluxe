import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rate-limit";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.EMAIL_FROM_NAME || "Siraj Luxe"}" <${process.env.EMAIL_FROM || "noreply@sirajluxe.com"}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "support@sirajluxe.com";

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 contact form submissions per 10 minutes per IP
    const { allowed } = rateLimit(`contact:${getIP(req)}`, { limit: 3, windowSec: 600 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please wait before sending another." },
        { status: 429 }
      );
    }

    const { name, email, subject, message } = await req.json();

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required (min 2 characters)" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Message is required (min 10 characters)" }, { status: 400 });
    }

    const safeName = escapeHtml(name.trim().slice(0, 100));
    const safeEmail = escapeHtml(email.trim().slice(0, 200));
    const safeSubject = escapeHtml((subject || "General Enquiry").toString().trim().slice(0, 200));
    const safeMessage = escapeHtml(message.trim().slice(0, 5000));

    // Send email to admin
    await transporter.sendMail({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: email.trim(),
      subject: `[Contact Form] ${safeSubject} — from ${safeName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#333;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;color:#555;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${safeName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;color:#555;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;color:#555;">Subject</td><td style="padding:8px;border-bottom:1px solid #eee;">${safeSubject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:8px;white-space:pre-wrap;color:#333;">${safeMessage}</div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("POST /api/contact error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
