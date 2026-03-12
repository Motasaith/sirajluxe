import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Customer, Product, Coupon, Settings, Order } from "@/lib/models";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { sendOrderConfirmation } from "@/lib/email";

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

    const { items, customerEmail, customerName, customerPhone, couponCode, shippingAddress } = await req.json();

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
    // Maps productId -> qty for global inventory, and "productId:color:size" -> qty for variant inventory
    const productIdMap: Record<string, number> = {};
    const variantMap: Record<string, number> = {};

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

      // Check variant-level inventory if variants exist, otherwise check global
      if (product.variants && product.variants.length > 0 && (item.color || item.size)) {
        const variant = product.variants.find(
          (v) => (v.color || "") === (item.color || "") && (v.size || "") === (item.size || "")
        );
        if (variant) {
          if (variant.inventory < item.quantity) {
            const label = [item.color, item.size].filter(Boolean).join(" / ");
            return NextResponse.json(
              { error: `Insufficient stock for ${product.name} (${label}). Only ${variant.inventory} available.` },
              { status: 400 }
            );
          }
          const variantKey = `${product._id}:${item.color || ""}:${item.size || ""}`;
          variantMap[variantKey] = (variantMap[variantKey] || 0) + item.quantity;
        } else {
          // Variant not found, fall back to global inventory check
          if (product.inventory < item.quantity) {
            return NextResponse.json(
              { error: `Insufficient stock for ${product.name}. Only ${product.inventory} available.` },
              { status: 400 }
            );
          }
        }
      } else {
        if (product.inventory < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}. Only ${product.inventory} available.` },
            { status: 400 }
          );
        }
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
          { returnDocument: 'after' }
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
      { upsert: true, returnDocument: 'after' }
    );
    const isFirstOrder = !customer || customer.orderCount === 0;
    const qualifiesForFreeShipping = isFirstOrder || subtotalPence >= FREE_SHIPPING_THRESHOLD;
    const shippingPence = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_RATE;

    // --- Tax calculation (fallback rate for Payment Intent flow) ---
    const taxRate = settings?.taxRate ?? 0;
    const taxableAmount = subtotalPence - discountPence;
    const taxPence = taxRate > 0 ? Math.round(taxableAmount * (taxRate / 100)) : 0;

    // --- Totals ---
    const totalPence = Math.max(0, subtotalPence - discountPence + shippingPence + taxPence);
    const resolvedEmail = customerEmail || customer?.email || "";

    // --- Create Order Number ---
    const orderNumber = `SL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // --- Shared address & summary helpers ---
    const typedAddress = shippingAddress as ShippingAddress;
    const STRIPE_GBP_MINIMUM = 30; // Stripe minimum charge: £0.30 (30 pence)

    const orderSummary = {
      items: orderItems,
      subtotal: subtotalPence / 100,
      discount: discountPence / 100,
      shipping: shippingPence / 100,
      tax: taxPence / 100,
      total: totalPence / 100,
      freeShippingReason: qualifiesForFreeShipping
        ? isFirstOrder
          ? "First order — free shipping!"
          : "Free shipping applied"
        : null,
      coupon: appliedCouponCode,
    };

    const shippingAddr = {
      line1: typedAddress.line1,
      line2: typedAddress.line2 || "",
      city: typedAddress.city,
      state: typedAddress.state || "",
      postalCode: typedAddress.postalCode,
      country: typedAddress.country || "GB",
    };

    // --- FREE ORDER: total below Stripe minimum (e.g. 100% coupon) ---
    if (totalPence < STRIPE_GBP_MINIMUM) {
      // Create order directly as paid — no Stripe needed
      await Order.create({
        orderNumber,
        stripeSessionId: "",
        paymentIntentId: `free_${orderNumber}`,
        clerkUserId: userId,
        customerEmail: resolvedEmail,
        customerName: customerName || "",
        customerPhone: customerPhone || "",
        items: orderItems,
        subtotal: subtotalPence / 100,
        discount: discountPence / 100,
        shipping: shippingPence / 100,
        tax: taxPence / 100,
        total: totalPence / 100,
        status: "processing",
        paymentStatus: "paid",
        shippingAddress: shippingAddr,
        ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
      });

      // Decrement inventory atomically (variant-level + global)
      for (const [variantKey, qty] of Object.entries(variantMap)) {
        const [productId, color, size] = variantKey.split(":");
        await Product.findOneAndUpdate(
          { _id: productId, "variants.color": color, "variants.size": size },
          { $inc: { "variants.$.inventory": -(qty as number) } }
        );
      }
      for (const [productId, qty] of Object.entries(productIdMap)) {
        const updated = await Product.findByIdAndUpdate(productId, {
          $inc: { inventory: -(qty as number) },
        }, { returnDocument: 'after' });
        if (updated) {
          updated.inStock = updated.inventory > 0;
          await updated.save();
        }
      }

      // Update customer stats
      if (userId) {
        await Customer.findOneAndUpdate(
          { clerkId: userId },
          {
            $inc: {
              orderCount: 1,
              totalSpent: totalPence / 100,
            },
          }
        );
      }

      // Send confirmation email (non-blocking)
      if (resolvedEmail) {
        sendOrderConfirmation({
          to: resolvedEmail,
          customerName: customerName || "Customer",
          orderNumber,
          items: orderItems,
          subtotal: subtotalPence / 100,
          shipping: shippingPence / 100,
          total: totalPence / 100,
          shippingAddress: shippingAddr,
        }).catch((err) =>
          console.error("Free order email failed:", err instanceof Error ? err.message : "Unknown")
        );
      }

      console.log(`Free order created: ${orderNumber} (total: £${(totalPence / 100).toFixed(2)})`);

      return NextResponse.json({
        freeOrder: true,
        orderNumber,
        orderSummary,
      });
    }

    // --- Create PaymentIntent (normal paid orders) ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPence,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: {
        clerkUserId: userId,
        orderNumber,
        isFirstOrder: isFirstOrder ? "true" : "false",
        productIds: JSON.stringify(productIdMap),
        ...(Object.keys(variantMap).length > 0 ? { variantIds: JSON.stringify(variantMap) } : {}),
        ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
      },
      ...(resolvedEmail ? { receipt_email: resolvedEmail } : {}),
    });

    // --- Create Pending Order ---
    await Order.create({
      orderNumber,
      stripeSessionId: "",
      paymentIntentId: paymentIntent.id,
      clerkUserId: userId,
      customerEmail: resolvedEmail,
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      items: orderItems,
      subtotal: subtotalPence / 100,
      discount: discountPence / 100,
      shipping: shippingPence / 100,
      tax: taxPence / 100,
      total: totalPence / 100,
      status: "pending",
      paymentStatus: "pending",
      shippingAddress: shippingAddr,
      ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber,
      orderSummary,
    });
  } catch (error) {
    console.error("POST /api/create-payment-intent error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
