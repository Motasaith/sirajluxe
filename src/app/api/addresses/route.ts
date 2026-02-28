import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Customer } from "@/lib/models";

// GET /api/addresses — list saved addresses
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const customer = await Customer.findOne({ clerkId: userId }).lean();
    return NextResponse.json({ addresses: customer?.addresses || [] });
  } catch (error) {
    console.error("GET /api/addresses error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

// POST /api/addresses — add a new address
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { label, line1, line2, city, postalCode, country, isDefault } = body;

    if (!line1?.trim() || !city?.trim() || !postalCode?.trim()) {
      return NextResponse.json({ error: "Line 1, city, and postal code are required" }, { status: 400 });
    }

    await connectDB();

    const address = {
      label: (label || "Home").trim().slice(0, 30),
      line1: line1.trim().slice(0, 100),
      line2: (line2 || "").trim().slice(0, 100),
      city: city.trim().slice(0, 50),
      postalCode: postalCode.trim().slice(0, 10),
      country: (country || "GB").trim().slice(0, 5),
      isDefault: Boolean(isDefault),
    };

    // If setting as default, unset other defaults
    if (address.isDefault) {
      await Customer.updateOne(
        { clerkId: userId },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const customer = await Customer.findOneAndUpdate(
      { clerkId: userId },
      { $push: { addresses: address } },
      { new: true, upsert: true }
    ).lean();

    // Max 10 addresses
    if (customer && customer.addresses && customer.addresses.length > 10) {
      await Customer.updateOne(
        { clerkId: userId },
        { $pop: { addresses: -1 } } // remove oldest
      );
    }

    return NextResponse.json({
      message: "Address saved",
      addresses: customer?.addresses || [],
    });
  } catch (error) {
    console.error("POST /api/addresses error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

// DELETE /api/addresses — delete an address by its _id
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");
    if (!addressId) return NextResponse.json({ error: "Address ID required" }, { status: 400 });

    await connectDB();
    const customer = await Customer.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).lean();

    return NextResponse.json({
      message: "Address deleted",
      addresses: customer?.addresses || [],
    });
  } catch (error) {
    console.error("DELETE /api/addresses error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
