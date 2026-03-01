import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { sendOrderShipped, sendOrderDelivered, sendReturnApproved, sendReturnDenied, sendTrackingUpdate } from "@/lib/email";
import { validateEnum, ORDER_STATUSES, ensureString } from "@/lib/validation";
import { logActivity } from "@/lib/activity-logger";

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
    const { status, trackingNumber, trackingCarrier, trackingUrl } = body;
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

    if (trackingCarrier !== undefined) {
      updateFields.trackingCarrier = ensureString(trackingCarrier) || "";
    }

    if (trackingUrl !== undefined) {
      updateFields.trackingUrl = ensureString(trackingUrl) || "";
    }

    if (body.adminNotes !== undefined) {
      const safeNotes = ensureString(body.adminNotes);
      updateFields.adminNotes = safeNotes || "";
    }

    if (body.returnStatus !== undefined) {
      const validReturnStatuses = ["none", "requested", "approved", "denied"];
      if (!validReturnStatuses.includes(body.returnStatus)) {
        return NextResponse.json({ error: "Invalid return status" }, { status: 400 });
      }
      updateFields.returnStatus = body.returnStatus;
    }

    // Get the order BEFORE update to compare status
    const previousOrder = await Order.findById(params.id).lean();
    const order = await Order.findByIdAndUpdate(params.id, updateFields, { returnDocument: 'after', runValidators: true }).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Log activity
    await logActivity({
      action: "update",
      entity: "order",
      entityId: params.id,
      details: `Updated order: ${Object.keys(updateFields).join(", ")}`,
    });

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
            trackingCarrier: updated.trackingCarrier || "",
            trackingUrl: updated.trackingUrl || "",
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

    // Send return status emails
    if (prev && prev.returnStatus !== updated.returnStatus && updated.customerEmail) {
      try {
        if (updated.returnStatus === "approved") {
          await sendReturnApproved({
            to: updated.customerEmail,
            customerName: updated.customerName || "",
            orderNumber: updated.orderNumber,
            total: updated.total,
          });
          console.log(`Return approved email sent for ${updated.orderNumber}`);
        } else if (updated.returnStatus === "denied") {
          await sendReturnDenied({
            to: updated.customerEmail,
            customerName: updated.customerName || "",
            orderNumber: updated.orderNumber,
          });
          console.log(`Return denied email sent for ${updated.orderNumber}`);
        }
      } catch (emailErr) {
        console.error("Failed to send return email:", emailErr instanceof Error ? emailErr.message : "Unknown error");
      }
    }

    // Send tracking update email (explicit request from admin)
    if (body.sendTrackingEmail && updated.trackingNumber && updated.customerEmail) {
      try {
        await sendTrackingUpdate({
          to: updated.customerEmail,
          customerName: updated.customerName || "",
          orderNumber: updated.orderNumber,
          trackingNumber: updated.trackingNumber,
          trackingCarrier: updated.trackingCarrier || "",
          trackingUrl: updated.trackingUrl || "",
        });
        console.log(`Tracking update email sent for ${updated.orderNumber}`);
      } catch (emailErr) {
        console.error("Failed to send tracking email:", emailErr instanceof Error ? emailErr.message : "Unknown error");
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
