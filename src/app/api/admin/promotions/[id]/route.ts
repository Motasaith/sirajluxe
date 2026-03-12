import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Promotion } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// PATCH /api/admin/promotions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard("admin");
  if (denied) return denied;

  try {
    await connectDB();
    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (body.name !== undefined) update.name = String(body.name || "").trim().slice(0, 120);
    if (body.type !== undefined) update.type = body.type;
    if (body.minimumSpend !== undefined) update.minimumSpend = Number(body.minimumSpend || 0);
    if (body.minimumItems !== undefined) update.minimumItems = Number(body.minimumItems || 0);
    if (body.discountValue !== undefined) update.discountValue = Number(body.discountValue || 0);
    if (body.active !== undefined) update.active = body.active === true;
    if (body.stackable !== undefined) update.stackable = body.stackable === true;
    if (body.startDate !== undefined) update.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) update.endDate = body.endDate ? new Date(body.endDate) : null;

    const promo = await Promotion.findByIdAndUpdate(params.id, { $set: update }, { new: true });
    if (!promo) return NextResponse.json({ error: "Promotion not found" }, { status: 404 });

    return NextResponse.json(promo);
  } catch (error) {
    console.error("PATCH /api/admin/promotions/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 });
  }
}

// DELETE /api/admin/promotions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await adminGuard("admin");
  if (denied) return denied;

  try {
    await connectDB();
    await Promotion.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/promotions/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 });
  }
}
