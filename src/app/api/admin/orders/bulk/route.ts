import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-logger";
import { sendOrderShipped, sendOrderDelivered } from "@/lib/email";

// PATCH /api/admin/orders/bulk
export async function PATCH(req: NextRequest) {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();
    const { orderIds, status } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "No orders selected" }, { status: 400 });
    }

    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const orders = await Order.find({ _id: { $in: orderIds } }).lean();
    const ordersToEmail = orders.filter(
      (o: { status: string; customerEmail: string }) => o.status !== status && o.customerEmail
    );

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status } }
    );

    // Send emails
    if (status === "shipped" || status === "delivered") {
      // Execute emails in parallel
      await Promise.allSettled(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ordersToEmail.map(async (o: any) => {
          try {
            if (status === "shipped") {
              await sendOrderShipped({
                to: o.customerEmail,
                customerName: o.customerName || "",
                orderNumber: o.orderNumber,
                trackingNumber: o.trackingNumber,
                trackingCarrier: o.trackingCarrier || "",
                trackingUrl: o.trackingUrl || "",
              });
            } else if (status === "delivered") {
              await sendOrderDelivered({
                to: o.customerEmail,
                customerName: o.customerName || "",
                orderNumber: o.orderNumber,
              });
            }
          } catch (e) {
            console.error(`Bulk email failed for ${o.orderNumber}:`, e);
          }
        })
      );
    }

    await logActivity({
      action: "update",
      entity: "order",
      entityId: "bulk", // Or null
      details: `Bulk updated ${result.modifiedCount} orders to status: ${status}`,
    });

    return NextResponse.json({ success: true, count: result.modifiedCount });
  } catch (error) {
    console.error("PATCH /api/admin/orders/bulk error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to perform bulk update" }, { status: 500 });
  }
}
