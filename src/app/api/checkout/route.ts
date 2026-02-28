import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Customer, Product, Coupon, Settings } from "@/lib/models";
import { rateLimit, getIP } from "@/lib/rate-limit";

interface CartItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 checkout attempts per minute per IP
    const { allowed } = rateLimit(`checkout:${getIP(req)}`, { limit: 5, windowSec: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

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

    const { items, customerEmail, couponCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    await connectDB();

    // --- Fetch shipping rates from Settings ---
    const settings = await Settings.findOne({ key: "global" }).lean();
    const STANDARD_SHIPPING_RATE = Math.round((settings?.shippingFlatRate ?? 3.99) * 100); // pence
    const FREE_SHIPPING_THRESHOLD = Math.round((settings?.freeShippingThreshold ?? 10) * 100); // pence

    // --- Server-side product lookup (never trust client prices) ---
    const lineItems = [];
    let subtotalPence = 0;
    const productIdMap: Record<string, number> = {};

    for (const item of items as CartItem[]) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Invalid item: productId and quantity are required" },
          { status: 400 }
        );
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.inStock) {
        return NextResponse.json(
          { error: `Product out of stock: ${product.name}` },
          { status: 400 }
        );
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Only ${product.inventory} available.` },
          { status: 400 }
        );
      }

      // Track product IDs for inventory management
      productIdMap[product._id.toString()] =
        (productIdMap[product._id.toString()] || 0) + item.quantity;

      const unitAmountPence = Math.round(product.price * 100);
      subtotalPence += unitAmountPence * item.quantity;

      // Build variant description from selected options
      const variantParts: string[] = [];
      if (item.color) variantParts.push(`Colour: ${item.color}`);
      if (item.size) variantParts.push(`Size: ${item.size}`);
      const variantDesc = variantParts.length > 0 ? variantParts.join(", ") : undefined;

      lineItems.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
            ...(variantDesc ? { description: variantDesc } : {}),
            ...(product.image ? { images: [product.image] } : {}),
          },
          unit_amount: unitAmountPence,
        },
        quantity: item.quantity,
      });
    }

    // --- Coupon / discount handling ---
    let stripeDiscounts: { coupon: string }[] = [];
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      if (typeof couponCode !== "string") {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      // Atomic: find a valid coupon AND increment usedCount in one operation
      // This prevents race conditions where two concurrent checkouts both pass the limit check
      const coupon = await Coupon.findOneAndUpdate(
        {
          code: couponCode.toUpperCase(),
          active: true,
          $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
          $expr: {
            $or: [
              { $eq: ["$maxUses", 0] },
              { $lt: ["$usedCount", "$maxUses"] },
            ],
          },
        },
        { $inc: { usedCount: 1 } },
        { returnDocument: 'after' }
      );

      if (coupon) {
        const subtotalPounds = subtotalPence / 100;
        if (subtotalPounds >= coupon.minOrderAmount) {
          let amountOff = 0;
          if (coupon.type === "percentage") {
            amountOff = Math.round(subtotalPence * (coupon.value / 100));
          } else {
            amountOff = Math.round(coupon.value * 100);
          }
          amountOff = Math.min(amountOff, subtotalPence);

          if (amountOff > 0) {
            const stripeCoupon = await stripe.coupons.create({
              amount_off: amountOff,
              currency: "gbp",
              duration: "once",
            });
            stripeDiscounts = [{ coupon: stripeCoupon.id }];
            appliedCouponCode = coupon.code;
          } else {
            // Coupon didn't apply — roll back the increment
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
          }
        } else {
          // Minimum order amount not met — roll back the increment
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
        }
      }
    }

    // Check if this is a first-time customer (for free shipping promo)
    const customer = await Customer.findOne({ clerkId: userId });
    const isFirstOrder = !customer || customer.orderCount === 0;

    // Resolve customer email: prefer explicit param, fall back to DB record
    const resolvedEmail = customerEmail || customer?.email || undefined;

    // Free shipping: always free on first order, OR spend above threshold on subsequent orders
    const qualifiesForFreeShipping = isFirstOrder || subtotalPence >= FREE_SHIPPING_THRESHOLD;

    // Shipping options
    const shippingOptions: { shipping_rate_data: { type: "fixed_amount"; fixed_amount: { amount: number; currency: string }; display_name: string; delivery_estimate?: { minimum: { unit: "business_day"; value: number }; maximum: { unit: "business_day"; value: number } } } }[] = [];

    if (qualifiesForFreeShipping) {
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "gbp" },
          display_name: isFirstOrder ? "Free Shipping (Welcome! Your First Order)" : "Free Shipping",
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      ...(stripeDiscounts.length > 0 ? { discounts: stripeDiscounts } : {}),
      shipping_address_collection: {
        allowed_countries: ["GB"],
      },
      shipping_options: shippingOptions,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`,
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      metadata: {
        clerkUserId: userId,
        isFirstOrder: isFirstOrder ? "true" : "false",
        productIds: JSON.stringify(productIdMap),
        ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/checkout error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
