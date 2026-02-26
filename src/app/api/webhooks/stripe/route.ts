import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Order, Customer, Product } from "@/lib/models";
import { sendOrderConfirmation } from "@/lib/email";

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
    console.error("Stripe webhook signature verification failed:", err);
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

      // Update customer stats
      if (session.metadata?.clerkUserId) {
        await Customer.findOneAndUpdate(
          { clerkId: session.metadata.clerkUserId },
          {
            $inc: {
              orderCount: 1,
              totalSpent: (session.amount_total || 0) / 100,
            },
          }
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
        console.error("Failed to send order confirmation email:", emailErr);
      }

      // Decrement inventory for purchased products
      const productIdMap = session.metadata?.productIds
        ? (JSON.parse(session.metadata.productIds) as Record<string, number>)
        : {};
      for (const [productId, qty] of Object.entries(productIdMap)) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { inventory: -(qty as number) },
        });
        const updated = await Product.findById(productId);
        if (updated && updated.inventory <= 0) {
          updated.inStock = false;
          await updated.save();
        }
      }

      break;
    }

    case "checkout.session.expired": {
      console.log("Checkout session expired:", event.data.object.id);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
      if (paymentIntentId) {
        await Order.findOneAndUpdate(
          { paymentIntentId },
          { paymentStatus: "refunded", status: "cancelled" }
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
