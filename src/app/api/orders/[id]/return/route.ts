import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { isValidObjectId } from "@/lib/validation";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { sendReturnRequest } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

const RETURN_WINDOW_DAYS = 7;

const VALID_REASONS = [
  "Damaged on arrival",
  "Item lost in transit",
  "Wrong item received",
  "Item defective",
  "Other",
];

// POST /api/orders/[id]/return — request a return (customer-facing)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { allowed } = rateLimit(`return-req:${getIP(req)}`, { limit: 5, windowSec: 300 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to request a return" }, { status: 401 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { reason, details } = body;

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: "Please select a valid return reason" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ _id: id, clerkUserId: userId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Must be delivered and paid
    if (order.status !== "delivered" || order.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Returns are only available for delivered orders" }, { status: 400 });
    }

    // Already has a return request
    if (order.returnStatus !== "none") {
      return NextResponse.json({ error: "A return request already exists for this order" }, { status: 409 });
    }

    // Check 7-day return window from updatedAt (when status changed to delivered)
    const deliveredDate = new Date(order.updatedAt);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      return NextResponse.json(
        { error: `The 7-day return window has expired. Your order was delivered ${daysSinceDelivery} days ago.` },
        { status: 400 }
      );
    }

    const fullReason = details ? `${reason}: ${details.slice(0, 500)}` : reason;

    order.returnStatus = "requested";
    order.returnReason = fullReason;
    order.returnRequestedAt = new Date();
    await order.save();

    // Send notification email to admin (non-blocking)
    sendReturnRequest({
      orderNumber: order.orderNumber,
      customerName: order.customerName || "Customer",
      customerEmail: order.customerEmail,
      reason: fullReason,
      total: order.total,
    }).catch((err) =>
      console.error("Return request email failed:", err instanceof Error ? err.message : "Unknown")
    );

    console.log(`Return requested for order ${order.orderNumber}: ${fullReason}`);

    // Create in-app notification
    createNotification({
      type: "return_request",
      message: `Return requested for order ${order.orderNumber} by ${order.customerName || order.customerEmail}`,
      link: `/admin/orders/${order._id}`,
    }).catch(() => {/* non-critical */});

    return NextResponse.json({
      message: "Return request submitted. We'll review it and get back to you within 1-2 business days.",
    });
  } catch (error) {
    console.error("POST /api/orders/[id]/return error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to submit return request" }, { status: 500 });
  }
}
