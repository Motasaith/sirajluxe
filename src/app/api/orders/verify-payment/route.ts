import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import { Order, Customer, Product, Coupon } from "@/lib/models";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * POST /api/orders/verify-payment
 * Called by checkout success page after Stripe payment completes.
 * Verifies payment with Stripe and confirms the order + sends email.
 * Acts as a reliable fallback when Stripe webhooks aren't configured or delayed.
 */
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment not yet confirmed", status: paymentIntent.status },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the order
    const order = await Order.findOne({ paymentIntentId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already processed — just return success
    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        alreadyProcessed: true,
      });
    }

    // Update order to paid/processing
    order.status = "processing";
    order.paymentStatus = "paid";
    await order.save();

    console.log(`[verify-payment] Order ${order.orderNumber} confirmed via verify-payment`);

    // Update or create customer
    if (order.clerkUserId) {
      await Customer.findOneAndUpdate(
        { clerkId: order.clerkUserId },
        {
          $inc: {
            orderCount: 1,
            totalSpent: order.total,
          },
          $setOnInsert: {
            clerkId: order.clerkUserId,
            email: order.customerEmail || "",
            firstName: (order.customerName || "").split(" ")[0] || "",
            lastName: (order.customerName || "").split(" ").slice(1).join(" ") || "",
          },
        },
        { upsert: true }
      );
    }

    // Decrement inventory
    const productIdMap = paymentIntent.metadata?.productIds
      ? (JSON.parse(paymentIntent.metadata.productIds) as Record<string, number>)
      : {};
    for (const [productId, qty] of Object.entries(productIdMap)) {
      const updated = await Product.findByIdAndUpdate(
        productId,
        { $inc: { inventory: -(qty as number) } },
        { returnDocument: "after" }
      );
      if (updated) {
        updated.inStock = updated.inventory > 0;
        await updated.save();
      }
    }

    // Handle coupon usage
    const couponCode = paymentIntent.metadata?.couponCode;
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Send confirmation email
    if (order.customerEmail) {
      try {
        await sendOrderConfirmation({
          to: order.customerEmail,
          customerName: order.customerName || "Customer",
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          shippingAddress: order.shippingAddress,
        });
        console.log(`[verify-payment] Confirmation email sent to ${order.customerEmail}`);
      } catch (emailErr) {
        console.error(
          "[verify-payment] Email failed:",
          emailErr instanceof Error ? emailErr.message : "Unknown"
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error(
      "POST /api/orders/verify-payment error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
