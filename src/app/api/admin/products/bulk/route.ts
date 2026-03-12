import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { adminGuard } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-logger";

// PATCH /api/admin/products/bulk — bulk update price/stock
export async function PATCH(req: NextRequest) {
  const denied = await adminGuard("admin");
  if (denied) return denied;

  try {
    await connectDB();
    const body = await req.json();
    const { ids, action, value } = body;

    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
      return NextResponse.json({ error: "Provide 1–100 product IDs" }, { status: 400 });
    }

    if (typeof value !== "number" || !isFinite(value)) {
      return NextResponse.json({ error: "Value must be a number" }, { status: 400 });
    }

    const allowedActions = ["set_price", "adjust_price", "set_stock", "adjust_stock"] as const;
    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Allowed: ${allowedActions.join(", ")}` },
        { status: 400 }
      );
    }

    let result;

    if (action === "set_price") {
      if (value < 0) return NextResponse.json({ error: "Price cannot be negative" }, { status: 400 });
      result = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { price: value } }
      );
    } else if (action === "adjust_price") {
      // Adjust price by percentage (+10 = +10%, -20 = -20%)
      const factor = 1 + value / 100;
      if (factor <= 0) return NextResponse.json({ error: "Adjustment would result in negative price" }, { status: 400 });
      result = await Product.updateMany(
        { _id: { $in: ids } },
        [{ $set: { price: { $max: [0.01, { $round: [{ $multiply: ["$price", factor] }, 2] }] } } }]
      );
    } else if (action === "set_stock") {
      if (value < 0) return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 });
      const intVal = Math.round(value);
      result = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { inventory: intVal, inStock: intVal > 0 } }
      );
    } else if (action === "adjust_stock") {
      const intVal = Math.round(value);
      result = await Product.updateMany(
        { _id: { $in: ids } },
        [
          {
            $set: {
              inventory: { $max: [0, { $add: ["$inventory", intVal] }] },
              inStock: { $gt: [{ $max: [0, { $add: ["$inventory", intVal] }] }, 0] },
            },
          },
        ]
      );
    }

    await logActivity({
      action: "update",
      entity: "product",
      details: `Bulk ${action}: ${ids.length} products, value=${value}`,
    });

    return NextResponse.json({
      success: true,
      matched: result?.matchedCount || 0,
      modified: result?.modifiedCount || 0,
    });
  } catch (error) {
    console.error("PATCH /api/admin/products/bulk error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to bulk update products" }, { status: 500 });
  }
}
