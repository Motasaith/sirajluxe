import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Customer } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";

// GET /api/admin/stats/customers
// Returns customer segmentation and analytics data
export async function GET() {
  const denied = await adminGuard(); if (denied) return denied;
  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalResult, newThisMonthResult, repeatResult, topCustomers, avgLTVResult] =
      await Promise.all([
        // Total customers
        Customer.countDocuments(),

        // New this month
        Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),

        // Repeat purchasers (more than 1 order)
        Customer.countDocuments({ orderCount: { $gt: 1 } }),

        // Top 5 customers by total spent
        Customer.find({ totalSpent: { $gt: 0 } })
          .sort({ totalSpent: -1 })
          .limit(5)
          .select("firstName lastName email totalSpent orderCount _id")
          .lean() as Promise<{ firstName: string; lastName: string; email: string; totalSpent: number; orderCount: number; _id: unknown }[]>,

        // Average LTV across all customers
        Customer.aggregate([
          { $match: { totalSpent: { $gt: 0 } } },
          { $group: { _id: null, avgLTV: { $avg: "$totalSpent" }, totalRevenue: { $sum: "$totalSpent" } } },
        ]),
      ]);

    const total = totalResult;
    const newThisMonth = newThisMonthResult;
    const repeatCount = repeatResult;
    const repeatRate = total > 0 ? Math.round((repeatCount / total) * 100) : 0;
    const avgLTV = avgLTVResult[0]?.avgLTV ?? 0;
    const totalRevenue = avgLTVResult[0]?.totalRevenue ?? 0;

    return NextResponse.json({
      total,
      newThisMonth,
      repeatCount,
      repeatRate,
      avgLTV: Math.round(avgLTV * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      topCustomers: topCustomers.map((c) => ({
        id: c._id,
        name: `${c.firstName} ${c.lastName}`.trim() || c.email,
        email: c.email,
        totalSpent: c.totalSpent,
        orderCount: c.orderCount,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/stats/customers error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch customer stats" }, { status: 500 });
  }
}
