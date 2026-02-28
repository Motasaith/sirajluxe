import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/lib/models";

// GET /api/coupons/public — fetch active, public coupons for homepage display
export async function GET() {
  try {
    await connectDB();

    const coupons = await Coupon.find({
      active: true,
      isPublic: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    })
      .select("code type value description expiresAt minOrderAmount maxUses usedCount")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Filter maxUses in JS to avoid $expr issues with some MongoDB versions
    const filtered = coupons.filter((c) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coupon = c as any;
      return coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses;
    }).slice(0, 5);

    // Remove internal fields before sending to client
    const cleaned = filtered.map((c) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { maxUses, usedCount, ...rest } = c as any;
      void maxUses; void usedCount;
      return rest;
    });

    return NextResponse.json({ coupons: cleaned });
  } catch (error) {
    console.error("GET /api/coupons/public error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ coupons: [] });
  }
}
