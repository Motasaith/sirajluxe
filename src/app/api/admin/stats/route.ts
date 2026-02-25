import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product, Order, Customer } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();

    const [totalProducts, totalOrders, totalCustomers, revenueAgg] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Customer.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Orders by status
    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
      },
      recentOrders,
      ordersByStatus: statusCounts.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        {}
      ),
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
