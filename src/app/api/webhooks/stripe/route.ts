import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Order, Customer, Product, Coupon } from "@/lib/models";
import { sendOrderConfirmation, sendOrderCancelled } from "@/lib/email";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Stripe sends webhook events here after payment
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  await connectDB();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Avoid duplicate orders
      const existingOrder = await Order.findOne({
        "stripeSessionId": session.id,
      });
      if (existingOrder) break;

      // Retrieve line items
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 }
      );

      const items = lineItems.data.map((item) => ({
        productId: item.price?.product as string || "",
        name: item.description || "Unknown Product",
        price: (item.amount_total || 0) / 100 / (item.quantity || 1),
        quantity: item.quantity || 1,
        image: "",
      }));

      const orderNumber = `SL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shippingDetails = (session as any).shipping_details;
      const customerDetails = session.customer_details;

      const order = await Order.create({
        orderNumber,
        stripeSessionId: session.id,
        paymentIntentId: typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || "",
        clerkUserId: session.metadata?.clerkUserId || "",
        customerEmail: customerDetails?.email || session.customer_email || "",
        customerName: customerDetails?.name || "",
        items,
        subtotal: (session.amount_subtotal || 0) / 100,
        shipping: (session.total_details?.amount_shipping || 0) / 100,
        tax: (session.total_details?.amount_tax || 0) / 100,
        total: (session.amount_total || 0) / 100,
        status: "processing",
        paymentStatus: "paid",
        shippingAddress: shippingDetails?.address
          ? {
              line1: shippingDetails.address.line1 || "",
              line2: shippingDetails.address.line2 || "",
              city: shippingDetails.address.city || "",
              state: shippingDetails.address.state || "",
              postalCode: shippingDetails.address.postal_code || "",
              country: shippingDetails.address.country || "",
            }
          : {},
      });

      // Update or create customer
      if (session.metadata?.clerkUserId) {
        await Customer.findOneAndUpdate(
          { clerkId: session.metadata.clerkUserId },
          {
            $inc: {
              orderCount: 1,
              totalSpent: (session.amount_total || 0) / 100,
            },
            $setOnInsert: {
              clerkId: session.metadata.clerkUserId,
              email: customerDetails?.email || session.customer_email || "",
              firstName: (customerDetails?.name || "").split(" ")[0] || "",
              lastName: (customerDetails?.name || "").split(" ").slice(1).join(" ") || "",
            },
          },
          { upsert: true }
        );
      }

      console.log(`Order created: ${order.orderNumber} — £${order.total}`);

      // Send order confirmation email
      try {
        await sendOrderConfirmation({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          shippingAddress: order.shippingAddress,
        });
        console.log(`Confirmation email sent to ${order.customerEmail}`);
      } catch (emailErr) {
        console.error("Failed to send order confirmation email:", emailErr instanceof Error ? emailErr.message : "Unknown error");
      }

      // Decrement inventory atomically for purchased products
      const productIdMap = session.metadata?.productIds
        ? (JSON.parse(session.metadata.productIds) as Record<string, number>)
        : {};
      for (const [productId, qty] of Object.entries(productIdMap)) {
        // Single atomic pipeline update: decrement inventory and update inStock flag
        await Product.findByIdAndUpdate(productId, [
          { $set: { inventory: { $max: [0, { $subtract: ["$inventory", qty as number] }] } } },
          { $set: { inStock: { $gt: ["$inventory", 0] } } },
        ]);
      }

      break;
    }

    case "checkout.session.expired": {
      // Roll back coupon usage for abandoned checkouts
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      const expiredCouponCode = expiredSession.metadata?.couponCode;
      if (expiredCouponCode) {
        await Coupon.findOneAndUpdate(
          { code: expiredCouponCode, usedCount: { $gt: 0 } },
          { $inc: { usedCount: -1 } }
        );
        console.log(`Coupon ${expiredCouponCode} usage rolled back (session expired)`);
      }
      console.log("Checkout session expired:", expiredSession.id);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
      if (paymentIntentId) {
        const refundedOrder = await Order.findOneAndUpdate(
          { paymentIntentId },
          { paymentStatus: "refunded", status: "cancelled" },
          { new: true }
        );
        // Send cancellation email to customer
        if (refundedOrder?.customerEmail) {
          try {
            await sendOrderCancelled({
              to: refundedOrder.customerEmail,
              customerName: refundedOrder.customerName || "Customer",
              orderNumber: refundedOrder.orderNumber,
              total: refundedOrder.total,
            });
            console.log(`Cancellation email sent to ${refundedOrder.customerEmail}`);
          } catch (emailErr) {
            console.error("Failed to send cancellation email:", emailErr instanceof Error ? emailErr.message : "Unknown error");
          }
        }
      }
      break;
    }

    case "payment_intent.succeeded": {
      const succeededPI = event.data.object as Stripe.PaymentIntent;

      // Find the pending order created by create-payment-intent
      const pendingOrder = await Order.findOneAndUpdate(
        { paymentIntentId: succeededPI.id, paymentStatus: "pending" },
        { status: "processing", paymentStatus: "paid" },
        { new: true }
      );

      if (pendingOrder) {
        console.log(`Payment succeeded — order ${pendingOrder.orderNumber} marked as processing`);

        // Update or create customer
        if (pendingOrder.clerkUserId) {
          await Customer.findOneAndUpdate(
            { clerkId: pendingOrder.clerkUserId },
            {
              $inc: {
                orderCount: 1,
                totalSpent: pendingOrder.total,
              },
              $setOnInsert: {
                clerkId: pendingOrder.clerkUserId,
                email: pendingOrder.customerEmail || "",
                firstName: (pendingOrder.customerName || "").split(" ")[0] || "",
                lastName: (pendingOrder.customerName || "").split(" ").slice(1).join(" ") || "",
              },
            },
            { upsert: true }
          );
        }

        // Send order confirmation email
        try {
          await sendOrderConfirmation({
            to: pendingOrder.customerEmail,
            customerName: pendingOrder.customerName,
            orderNumber: pendingOrder.orderNumber,
            items: pendingOrder.items,
            subtotal: pendingOrder.subtotal,
            shipping: pendingOrder.shipping,
            total: pendingOrder.total,
            shippingAddress: pendingOrder.shippingAddress,
          });
          console.log(`Confirmation email sent to ${pendingOrder.customerEmail}`);
        } catch (emailErr) {
          console.error("Failed to send order confirmation email:", emailErr instanceof Error ? emailErr.message : "Unknown error");
        }

        // Decrement inventory atomically
        const piProductIdMap = succeededPI.metadata?.productIds
          ? (JSON.parse(succeededPI.metadata.productIds) as Record<string, number>)
          : {};
        for (const [productId, qty] of Object.entries(piProductIdMap)) {
          await Product.findByIdAndUpdate(productId, [
            { $set: { inventory: { $max: [0, { $subtract: ["$inventory", qty as number] }] } } },
            { $set: { inStock: { $gt: ["$inventory", 0] } } },
          ]);
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const failedOrder = await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: "failed" },
        { new: true }
      );
      if (failedOrder) {
        console.log(`Payment failed for order ${failedOrder.orderNumber}: ${paymentIntent.last_payment_error?.message || "Unknown error"}`);
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const disputeCharge = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
      if (disputeCharge) {
        // Find order by payment intent from the charge
        const disputePaymentIntent = typeof dispute.payment_intent === "string"
          ? dispute.payment_intent
          : dispute.payment_intent?.id;
        if (disputePaymentIntent) {
          await Order.findOneAndUpdate(
            { paymentIntentId: disputePaymentIntent },
            { $set: { "adminNotes": `⚠️ DISPUTE OPENED (${new Date().toISOString()}): Reason — ${dispute.reason || "unknown"}. Amount: £${(dispute.amount / 100).toFixed(2)}` } }
          );
          console.log(`Dispute created for payment ${disputePaymentIntent}: ${dispute.reason}`);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
