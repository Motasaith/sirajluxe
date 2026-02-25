import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models";

// Shipping rates (in pence)
const STANDARD_SHIPPING_RATE = 399; // £3.99
const FREE_SHIPPING_THRESHOLD = 1000; // £10.00 in pence

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, customerEmail } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Check if this is a first-time customer (for free shipping promo)
    await connectDB();
    const customer = await Customer.findOne({ clerkId: userId });
    const isFirstOrder = !customer || customer.orderCount === 0;

    // Calculate subtotal in pence
    const subtotalPence = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Free shipping: first order AND spend £10+
    const qualifiesForFreeShipping = isFirstOrder && subtotalPence >= FREE_SHIPPING_THRESHOLD;

    // Build Stripe line items
    const lineItems = items.map(
      (item: {
        name: string;
        price: number;
        quantity: number;
        image?: string;
      }) => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100), // pence
        },
        quantity: item.quantity,
      })
    );

    // Shipping options
    const shippingOptions: { shipping_rate_data: { type: "fixed_amount"; fixed_amount: { amount: number; currency: string }; display_name: string; delivery_estimate?: { minimum: { unit: "business_day"; value: number }; maximum: { unit: "business_day"; value: number } } } }[] = [];

    if (qualifiesForFreeShipping) {
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "gbp" },
          display_name: "Free Shipping (First Order Promo!)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      });
    }

    shippingOptions.push({
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: STANDARD_SHIPPING_RATE, currency: "gbp" },
        display_name: "Standard Shipping (UK)",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 3 },
          maximum: { unit: "business_day", value: 5 },
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["GB"],
      },
      shipping_options: shippingOptions,
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/shop`,
      customer_email: customerEmail,
      metadata: {
        clerkUserId: userId,
        isFirstOrder: isFirstOrder ? "true" : "false",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
