import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product, Settings } from "@/lib/models";
import { sendLowStockAlert } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

// Vercel Cron: runs daily at 8am to alert admin of low/out-of-stock products
// Protected by CRON_SECRET to prevent unauthorized access
export async function GET(req: NextRequest) {
  const requestSecret = req.headers.get("x-cron-secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !requestSecret || requestSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const settings = await Settings.findOne().lean() as { lowStockThreshold?: number } | null;
  const threshold = settings?.lowStockThreshold ?? 5;

  // Find products with inventory at or below threshold (including out-of-stock)
  const lowStockProducts = await Product.find({
    inventory: { $lte: threshold },
  })
    .select("name slug inventory inStock")
    .lean() as { name: string; slug: string; inventory: number; inStock: boolean }[];

  if (lowStockProducts.length === 0) {
    return NextResponse.json({ message: "No low stock products found", threshold });
  }

  // Send email alert to admin
  await sendLowStockAlert({
    products: lowStockProducts.map((p) => ({
      name: p.name,
      inventory: p.inventory,
      slug: p.slug,
    })),
  });

  // Create in-app notifications for each low-stock product (cap at 10 to avoid noise)
  const toNotify = lowStockProducts.slice(0, 10);
  for (const product of toNotify) {
    const stockLabel = product.inventory === 0 ? "out of stock" : `only ${product.inventory} left`;
    await createNotification({
      type: "low_stock",
      message: `${product.name} is ${stockLabel}`,
      link: `/admin/products`,
    });
  }

  return NextResponse.json({
    message: `Low stock alert sent for ${lowStockProducts.length} products`,
    threshold,
    products: lowStockProducts.map((p) => ({ name: p.name, inventory: p.inventory })),
  });
}
