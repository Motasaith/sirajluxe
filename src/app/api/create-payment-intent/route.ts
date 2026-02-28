import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Customer, Product, Coupon, Settings, Order } from "@/lib/models";
import { rateLimit, getIP } from "@/lib/rate-limit";

interface CartItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export async function POST(req: NextRequest) {
  try {
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

    const { items, customerEmail, customerName, couponCode, shippingAddress } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.postalCode) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }

    await connectDB();

    // --- Settings ---
    const settings = await Settings.findOne({ key: "global" }).lean();
    const STANDARD_SHIPPING_RATE = Math.round((settings?.shippingFlatRate ?? 3.99) * 100);
    const FREE_SHIPPING_THRESHOLD = Math.round((settings?.freeShippingThreshold ?? 10) * 100);

    // --- Validate products ---
    const orderItems: { productId: string; name: string; price: number; quantity: number; image: string; color?: string; size?: string }[] = [];
    let subtotalPence = 0;
    const productIdMap: Record<string, number> = {};

    for (const item of items as CartItem[]) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ error: "Invalid item" }, { status: 400 });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (!product.inStock) {
        return NextResponse.json({ error: `Out of stock: ${product.name}` }, { status: 400 });
      }
      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Only ${product.inventory} available.` },
          { status: 400 }
        );
      }

      productIdMap[product._id.toString()] = (productIdMap[product._id.toString()] || 0) + item.quantity;
      const unitAmountPence = Math.round(product.price * 100);
      subtotalPence += unitAmountPence * item.quantity;

      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || "",
        ...(item.color ? { color: item.color } : {}),
        ...(item.size ? { size: item.size } : {}),
      });
    }

    // --- Coupon handling ---
    let discountPence = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode && typeof couponCode === "string") {
      // First find the coupon to validate it
      const foundCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        active: true,
        $or: [
          { expiresAt: null },
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      });

      // Validate maxUses in JS and atomically increment
      if (foundCoupon && (foundCoupon.maxUses === 0 || foundCoupon.usedCount < foundCoupon.maxUses)) {
        const coupon = await Coupon.findOneAndUpdate(
          {
            _id: foundCoupon._id,
            $or: [
              { maxUses: 0 },
              { $expr: { $lt: ["$usedCount", "$maxUses"] } },
            ],
          },
          { $inc: { usedCount: 1 } },
          { new: true }
        );

        if (coupon) {
          const subtotalPounds = subtotalPence / 100;
          if (subtotalPounds >= coupon.minOrderAmount) {
            if (coupon.type === "percentage") {
              discountPence = Math.round(subtotalPence * (coupon.value / 100));
            } else {
              discountPence = Math.round(coupon.value * 100);
            }
            discountPence = Math.min(discountPence, subtotalPence);

            if (discountPence > 0) {
              appliedCouponCode = coupon.code;
            } else {
              await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
            }
          } else {
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
          }
        }
      }
    }

    // --- Shipping ---
    // Ensure customer record exists (upsert)
    const customer = await Customer.findOneAndUpdate(
      { clerkId: userId },
      {
        $setOnInsert: {
          clerkId: userId,
          email: customerEmail || "",
          firstName: customerName?.split(" ")[0] || "",
          lastName: customerName?.split(" ").slice(1).join(" ") || "",
        },
      },
      { upsert: true, new: true }
    );
    const isFirstOrder = !customer || customer.orderCount === 0;
    const qualifiesForFreeShipping = isFirstOrder || subtotalPence >= FREE_SHIPPING_THRESHOLD;
    const shippingPence = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_RATE;

    // --- Totals ---
    const totalPence = Math.max(0, subtotalPence - discountPence + shippingPence);
    const resolvedEmail = customerEmail || customer?.email || "";

    // --- Create Order Number ---
    const orderNumber = `SL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // --- Create PaymentIntent ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPence,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: {
        clerkUserId: userId,
        orderNumber,
        isFirstOrder: isFirstOrder ? "true" : "false",
        productIds: JSON.stringify(productIdMap),
        ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
      },
      ...(resolvedEmail ? { receipt_email: resolvedEmail } : {}),
    });

    // --- Create Pending Order ---
    const typedAddress = shippingAddress as ShippingAddress;
    await Order.create({
      orderNumber,
      stripeSessionId: "",
      paymentIntentId: paymentIntent.id,
      clerkUserId: userId,
      customerEmail: resolvedEmail,
      customerName: customerName || "",
      items: orderItems,
      subtotal: subtotalPence / 100,
      discount: discountPence / 100,
      shipping: shippingPence / 100,
      tax: 0,
      total: totalPence / 100,
      status: "pending",
      paymentStatus: "pending",
      shippingAddress: {
        line1: typedAddress.line1,
        line2: typedAddress.line2 || "",
        city: typedAddress.city,
        state: typedAddress.state || "",
        postalCode: typedAddress.postalCode,
        country: typedAddress.country || "GB",
      },
      ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber,
      orderSummary: {
        items: orderItems,
        subtotal: subtotalPence / 100,
        discount: discountPence / 100,
        shipping: shippingPence / 100,
        total: totalPence / 100,
        freeShippingReason: qualifiesForFreeShipping
          ? isFirstOrder
            ? "First order — free shipping!"
            : "Free shipping applied"
          : null,
        coupon: appliedCouponCode,
      },
    });
  } catch (error) {
    console.error("POST /api/create-payment-intent error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
