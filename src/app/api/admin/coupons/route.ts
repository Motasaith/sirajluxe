import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Coupon } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { isValidObjectId } from "@/lib/validation";

// GET /api/admin/coupons
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ docs: coupons });
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST /api/admin/coupons
export async function POST(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();

    if (!body.code || !body.type || body.value == null) {
      return NextResponse.json({ error: "Code, type and value are required" }, { status: 400 });
    }

    if (!["percentage", "fixed"].includes(body.type)) {
      return NextResponse.json({ error: "Type must be percentage or fixed" }, { status: 400 });
    }

    if (body.type === "percentage" && (body.value < 0 || body.value > 100)) {
      return NextResponse.json({ error: "Percentage value must be between 0 and 100" }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: body.code,
      type: body.type,
      value: body.value,
      minOrderAmount: body.minOrderAmount || 0,
      maxUses: body.maxUses || 0,
      expiresAt: body.expiresAt || null,
      active: body.active !== false,
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/coupons error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

// PUT /api/admin/coupons
export async function PUT(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();

    if (!isValidObjectId(body.id)) {
      return NextResponse.json({ error: "Valid coupon ID required" }, { status: 400 });
    }

    // Whitelist allowed fields — prevent mass assignment
    const allowed: Record<string, unknown> = {};
    if (body.code !== undefined) allowed.code = body.code;
    if (body.type !== undefined) {
      if (!["percentage", "fixed"].includes(body.type)) {
        return NextResponse.json({ error: "Type must be percentage or fixed" }, { status: 400 });
      }
      allowed.type = body.type;
    }
    if (body.value !== undefined) allowed.value = body.value;
    if (body.minOrderAmount !== undefined) allowed.minOrderAmount = body.minOrderAmount;
    if (body.maxUses !== undefined) allowed.maxUses = body.maxUses;
    if (body.expiresAt !== undefined) allowed.expiresAt = body.expiresAt;
    if (body.active !== undefined) allowed.active = body.active;

    const updated = await Coupon.findByIdAndUpdate(body.id, allowed, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/coupons error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons
export async function DELETE(req: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await connectDB();
    const { id } = await req.json();
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Valid coupon ID required" }, { status: 400 });
    }
    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/coupons error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
