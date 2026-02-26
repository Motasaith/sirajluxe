import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Customer, Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const { id } = await params;
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const orders = await Order.find({ clerkUserId: customer.clerkId })
      .select("orderNumber total status paymentStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ docs: orders });
  } catch (error) {
    console.error("GET /api/admin/customers/[id]/orders error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
