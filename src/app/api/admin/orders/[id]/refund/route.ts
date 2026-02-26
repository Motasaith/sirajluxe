import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { stripe } from "@/lib/stripe";
import { logActivity } from "@/lib/activity-logger";

// POST /api/admin/orders/[id]/refund — issue a Stripe refund
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard();
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

    // Issue refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      ...(amount ? { amount } : {}), // omit amount for full refund
    });

    if (refund.status === "succeeded" || refund.status === "pending") {
      order.paymentStatus = "refunded";
      if (order.status !== "cancelled") {
        order.status = "cancelled";
      }
      await order.save();

      await logActivity({
        action: "update",
        entity: "order",
        entityId: params.id,
        details: `Refunded order ${order.orderNumber}: ${amount ? `£${(amount / 100).toFixed(2)} partial` : "full refund"}`,
      });

      return NextResponse.json({
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: (refund.amount || 0) / 100,
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
