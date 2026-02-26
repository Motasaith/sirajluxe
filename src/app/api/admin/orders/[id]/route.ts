import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/email";
import { validateEnum, ORDER_STATUSES, ensureString } from "@/lib/validation";

// GET /api/admin/orders/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const order = await Order.findById(params.id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();

    // Only allow updating status and trackingNumber — validate types
    const { status, trackingNumber } = body;
    const updateFields: Record<string, unknown> = {};

    if (status) {
      const validStatus = validateEnum(status, ORDER_STATUSES);
      if (!validStatus) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
      }
      updateFields.status = validStatus;
    }

    if (trackingNumber !== undefined) {
      const safeTracking = ensureString(trackingNumber);
      if (safeTracking === null && trackingNumber !== null) {
        return NextResponse.json({ error: "Invalid tracking number" }, { status: 400 });
      }
      updateFields.trackingNumber = safeTracking || "";
    }

    // Get the order BEFORE update to compare status
    const previousOrder = await Order.findById(params.id).lean();
    const order = await Order.findByIdAndUpdate(params.id, updateFields, { new: true, runValidators: true }).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Send status-change emails
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prev = previousOrder as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = order as any;

    if (prev && prev.status !== updated.status && updated.customerEmail) {
      try {
        if (updated.status === "shipped") {
          await sendOrderShipped({
            to: updated.customerEmail,
            customerName: updated.customerName || "",
            orderNumber: updated.orderNumber,
            trackingNumber,
          });
          console.log(`Shipped email sent for ${updated.orderNumber}`);
        } else if (updated.status === "delivered") {
          await sendOrderDelivered({
            to: updated.customerEmail,
            customerName: updated.customerName || "",
            orderNumber: updated.orderNumber,
          });
          console.log(`Delivered email sent for ${updated.orderNumber}`);
        }
      } catch (emailErr) {
        console.error("Failed to send status email:", emailErr instanceof Error ? emailErr.message : "Unknown error");
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
