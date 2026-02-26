import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Customer } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { capInt } from "@/lib/validation";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/admin/customers
export async function GET(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = capInt(searchParams.get("page"), 1, 1, 1000);
    const limit = capInt(searchParams.get("limit"), 20, 1, 100);
    const search = searchParams.get("search") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { email: { $regex: escaped, $options: "i" } },
        { firstName: { $regex: escaped, $options: "i" } },
        { lastName: { $regex: escaped, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return NextResponse.json({
      docs: customers,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
