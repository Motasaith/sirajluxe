import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/lib/models";

/**
 * POST /api/orders/track
 * Public endpoint — looks up an order by order number + email for verification.
 * Returns order status, tracking number, and timeline info.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderNumber, email } = await req.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      orderNumber: orderNumber.trim().toUpperCase(),
      customerEmail: email.trim().toLowerCase(),
    }).select(
      "orderNumber status paymentStatus trackingNumber items customerName shippingAddress shipping total createdAt updatedAt"
    );

    if (!order) {
      return NextResponse.json(
        { error: "No order found with that order number and email combination" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || null,
      itemCount: order.items.length,
      total: order.total,
      shipping: order.shipping,
      shippingAddress: order.shippingAddress
        ? {
            city: order.shippingAddress.city,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 }
    );
  }
}
