import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Customer } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { sendAdminMessage } from "@/lib/email";
import { logActivity } from "@/lib/activity-logger";

// POST /api/admin/customers/[id]/email — send a message to a customer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard("support");
  if (denied) return denied;

  try {
    await connectDB();
    const customer = await Customer.findById(params.id).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const body = await req.json();
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const storeEmail = process.env.EMAIL_FROM || "";

    await sendAdminMessage({
      to: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`.trim() || customer.email,
      subject,
      message,
      replyTo: storeEmail,
    });

    await logActivity({
      action: "create",
      entity: "customer",
      entityId: params.id,
      details: `Sent email to ${customer.email}: "${subject}"`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/customers/[id]/email error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
