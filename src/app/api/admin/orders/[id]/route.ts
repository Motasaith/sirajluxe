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
  const denied = await adminGuard("admin"); if (denied) return denied;
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

    if (body.returnShippingAddress !== undefined) {
      updateFields.returnShippingAddress = ensureString(body.returnShippingAddress) || "";
    }
    if (body.returnCarrier !== undefined) {
      updateFields.returnCarrier = ensureString(body.returnCarrier) || "";
    }
    if (body.returnInstructions !== undefined) {
      updateFields.returnInstructions = ensureString(body.returnInstructions) || "";
    }

    // Get the order BEFORE update to compare status and allow controlled item edits.
    const previousOrder = await Order.findById(params.id).lean();
    if (!previousOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Pre-shipment order edit: pending/processing only.
    if (body.items !== undefined) {
      const canEditItems = ["pending", "processing"].includes(previousOrder.status);
      if (!canEditItems) {
        return NextResponse.json({ error: "Items can only be edited before shipment" }, { status: 400 });
      }
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
      }

      const sanitizedItems = body.items.map((item: Record<string, unknown>) => ({
        productId: String(item.productId || "").trim(),
        name: String(item.name || "").trim(),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        image: String(item.image || ""),
        color: String(item.color || ""),
        size: String(item.size || ""),
      }));

      const invalid = sanitizedItems.some(
        (i: { productId: string; name: string; price: number; quantity: number }) => !i.productId || !i.name || i.price < 0 || i.quantity < 1
      );
      if (invalid) {
        return NextResponse.json({ error: "Invalid item payload" }, { status: 400 });
      }

      const round2 = (n: number) => Math.round(n * 100) / 100;
      const newSubtotal = round2(
        sanitizedItems.reduce(
          (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
          0
        )
      );

      const oldSubtotal = Number(previousOrder.subtotal || 0);
      const oldDiscount = Number(previousOrder.discount || 0);
      const oldTax = Number(previousOrder.tax || 0);
      const oldShipping = Number(previousOrder.shipping || 0);
      const discountRatio = oldSubtotal > 0 ? oldDiscount / oldSubtotal : 0;
      const newDiscount = round2(Math.max(0, Math.min(newSubtotal, newSubtotal * discountRatio)));
      const oldTaxBase = Math.max(0, oldSubtotal - oldDiscount);
      const taxRatio = oldTaxBase > 0 ? oldTax / oldTaxBase : 0;
      const newTax = round2(Math.max(0, (newSubtotal - newDiscount) * taxRatio));
      const newTotal = round2(Math.max(0, newSubtotal - newDiscount + oldShipping + newTax));

      updateFields.items = sanitizedItems;
      updateFields.subtotal = newSubtotal;
      updateFields.discount = newDiscount;
      updateFields.tax = newTax;
      updateFields.total = newTotal;
    }

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
            returnShippingAddress: updated.returnShippingAddress || "",
            returnCarrier: updated.returnCarrier || "",
            returnInstructions: updated.returnInstructions || "",
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
