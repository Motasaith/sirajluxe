import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Promotion } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/promotions
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    await connectDB();
    const promotions = await Promotion.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("GET /api/admin/promotions error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

// POST /api/admin/promotions
export async function POST(req: NextRequest) {
  const denied = await adminGuard("admin");
  if (denied) return denied;

  try {
    await connectDB();
    const body = await req.json();
    const promo = await Promotion.create({
      name: String(body.name || "").trim().slice(0, 120),
      type: body.type,
      minimumSpend: Number(body.minimumSpend || 0),
      minimumItems: Number(body.minimumItems || 0),
      discountValue: Number(body.discountValue || 0),
      active: body.active !== false,
      stackable: body.stackable === true,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/promotions error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}
