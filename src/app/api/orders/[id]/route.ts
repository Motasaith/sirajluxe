import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { isValidObjectId } from "@/lib/validation";

// GET /api/orders/[id] — get a single order for the authenticated user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const guestEmail = req.nextUrl.searchParams.get("guest_email");
    if (!userId && !guestEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { _id: id };
    if (guestEmail) {
      query.customerEmail = guestEmail;
    } else {
      query.clerkUserId = userId;
    }

    const order = await Order.findOne(query).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(
      "GET /api/orders/[id] error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
