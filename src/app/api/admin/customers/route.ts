import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Customer } from "@/lib/models";

// GET /api/admin/customers
export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ docs: customers });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
