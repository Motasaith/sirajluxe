import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-auth";
import connectDB from "@/lib/mongodb";
import { Product, Order } from "@/lib/models";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Since we don't have dedicated 'views' tracking across the app,
    // we'll simulate views based on a multiplier of orders for aesthetic purposes if needed,
    // but we can compute real conversion metrics based on what we do have: orders.

    const orders = await Order.find({
      "items.productId": id,
      status: { $ne: "cancelled" }
    }).lean();

    let totalRevenue = 0;
    let totalUnitsSold = 0;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyData: Record<string, { revenue: number; units: number; orders: number }> = {};
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthlyData[d.toLocaleString("default", { month: "short" })] = { revenue: 0, units: 0, orders: 0 };
    }

    orders.forEach(order => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const item = order.items.find((i: any) => i.productId.toString() === id);
        if (item) {
            totalRevenue += item.price * item.quantity;
            totalUnitsSold += item.quantity;

            const orderDate = new Date(order.createdAt as unknown as string);
            if (orderDate >= sixMonthsAgo) {
                const month = orderDate.toLocaleString("default", { month: "short" });
                if (monthlyData[month]) {
                    monthlyData[month].revenue += item.price * item.quantity;
                    monthlyData[month].units += item.quantity;
                    monthlyData[month].orders += 1;
                }
            }
        }
    });

    // Formatting for charts
    const revenueByMonth = Object.entries(monthlyData)
        .reverse()
        .map(([month, data]) => ({
            month,
            revenue: data.revenue,
            units: data.units,
            orders: data.orders
        }));

    return NextResponse.json({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        inventory: product.inventory,
        inStock: product.inStock,
      },
      analytics: {
        totalRevenue,
        totalUnitsSold,
        totalOrders: orders.length,
        revenueByMonth,
      }
    });
  } catch (error: unknown) {
    console.error("Failed to fetch product analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
