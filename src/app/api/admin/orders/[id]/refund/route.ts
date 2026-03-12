import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { stripe } from "@/lib/stripe";
import { logActivity } from "@/lib/activity-logger";
import { createNotification } from "@/lib/notifications";

// POST /api/admin/orders/[id]/refund — issue a Stripe refund
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard("super_admin");
  if (denied) return denied;

  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  try {
    await connectDB();
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "refunded") {
      return NextResponse.json({ error: "Order is already refunded" }, { status: 400 });
    }

    if (!order.paymentIntentId) {
      return NextResponse.json({ error: "No payment intent found for this order" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = body.amount ? Math.round(body.amount * 100) : undefined; // partial refund in pence
    const reason: string = body.reason || "";

    // Issue refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      ...(amount ? { amount } : {}), // omit amount for full refund
    });

    if (refund.status === "succeeded" || refund.status === "pending") {
      const refundAmountPounds = (refund.amount || 0) / 100;
      const isFullRefund = !amount || amount >= Math.round(order.total * 100);

      // Record the refund in the order's refund history
      order.refunds.push({
        stripeRefundId: refund.id,
        amount: refundAmountPounds,
        reason,
        type: isFullRefund ? "full" : "partial",
        date: new Date(),
      });
      order.refundedAmount = (order.refundedAmount || 0) + refundAmountPounds;

      // Set payment status based on refund type
      if (isFullRefund) {
        order.paymentStatus = "refunded";
        if (order.status !== "cancelled") {
          order.status = "cancelled";
        }
      } else {
        order.paymentStatus = "partially_refunded";
      }

      await order.save();

      await logActivity({
        action: "update",
        entity: "order",
        entityId: params.id,
        details: `Refunded order ${order.orderNumber}: £${refundAmountPounds.toFixed(2)} ${isFullRefund ? "full" : "partial"} refund`,
      });

      await createNotification({
        type: "refund_issued",
        message: `Refund issued for order ${order.orderNumber}: £${refundAmountPounds.toFixed(2)} ${isFullRefund ? "(full)" : "(partial)"}`,
        link: `/admin/orders/${params.id}`,
      });

      return NextResponse.json({
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refundAmountPounds,
      });
    }

    return NextResponse.json({ error: `Refund status: ${refund.status}` }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/orders/[id]/refund error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process refund" },
      { status: 500 }
    );
  }
}
