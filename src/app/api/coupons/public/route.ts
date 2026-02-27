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
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      $expr: {
        $or: [
          { $eq: ["$maxUses", 0] },
          { $lt: ["$usedCount", "$maxUses"] },
        ],
      },
    })
      .select("code type value description expiresAt minOrderAmount")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("GET /api/coupons/public error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ coupons: [] });
  }
}
