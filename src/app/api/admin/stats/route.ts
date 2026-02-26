import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product, Order, Customer } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

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

    // Trends: this month vs last month
    const [thisMonthOrders, lastMonthOrders, thisMonthRevAgg, lastMonthRevAgg] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Order.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const thisMonthRevenue = thisMonthRevAgg[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevAgg[0]?.total || 0;

    const ordersTrend = lastMonthOrders > 0
      ? Math.round(((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : thisMonthOrders > 0 ? 100 : 0;

    const revenueTrend = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0;

    // Low stock products (inventory <= 5 and inStock)
    const lowStockProducts = await Product.find({ inStock: true, inventory: { $lte: 5 } })
      .select("name slug inventory image")
      .sort({ inventory: 1 })
      .limit(10)
      .lean();

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Orders by status
    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top products by revenue
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          unitsSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
      },
      trends: {
        ordersTrend,
        revenueTrend,
      },
      lowStockProducts,
      recentOrders,
      ordersByStatus: statusCounts.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        {}
      ),
      revenueByMonth: revenueByMonth.map((r) => ({
        month: r._id,
        revenue: r.revenue,
        orders: r.orders,
      })),
      topProducts: topProducts.map((p) => ({
        name: p._id,
        revenue: p.revenue,
        unitsSold: p.unitsSold,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
