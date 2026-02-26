import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/lib/models/coupon";

export async function POST(req: NextRequest) {
  try {
    // Require authentication to prevent anonymous brute-force enumeration
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to apply a coupon" }, { status: 401 });
    }

    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }

    await connectDB();

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

    // Return a generic error for invalid / expired / maxed-out coupons
    // to prevent enumeration attacks
    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
    }

    if (subtotal && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of £${coupon.minOrderAmount.toFixed(2)} required` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (subtotal || 0) * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.min(discount, subtotal || discount),
      description:
        coupon.type === "percentage"
          ? `${coupon.value}% off`
          : `£${coupon.value.toFixed(2)} off`,
    });
  } catch (error) {
    console.error("Coupon validation error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
