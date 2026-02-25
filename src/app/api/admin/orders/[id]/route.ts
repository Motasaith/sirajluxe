import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/orders/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const order = await Order.findById(params.id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    const order = await Order.findByIdAndUpdate(params.id, body, { new: true }).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
