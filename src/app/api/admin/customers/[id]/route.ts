import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Customer } from "@/lib/models";
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
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    console.error("GET /api/admin/customers/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}
