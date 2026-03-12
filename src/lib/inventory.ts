import connectDB from "@/lib/mongodb";
import { InventoryReservation, Product } from "@/lib/models";

const RESERVATION_TTL_MIN = 15;

/**
 * Reserve inventory for a checkout session.
 * Returns { success: true } or { success: false, error: string } if insufficient stock.
 */
export async function reserveInventory(
  sessionId: string,
  items: { productId: string; quantity: number; color?: string; size?: string }[]
): Promise<{ success: true } | { success: false; error: string }> {
  await connectDB();
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MIN * 60 * 1000);

  // First, release any existing reservations for this session
  await InventoryReservation.deleteMany({ sessionId });

  for (const item of items) {
    const product = await Product.findById(item.productId).lean();
    if (!product) {
      await InventoryReservation.deleteMany({ sessionId });
      return { success: false, error: `Product not found: ${item.productId}` };
    }

    const variantKey =
      item.color || item.size ? `${item.color || ""}:${item.size || ""}` : "";

    // Calculate already-reserved quantity for this product+variant (by other sessions)
    const existingReservations = await InventoryReservation.aggregate([
      {
        $match: {
          productId: product._id,
          variantKey,
          sessionId: { $ne: sessionId },
          expiresAt: { $gt: new Date() },
        },
      },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const reservedQty = existingReservations[0]?.total || 0;

    // Check available stock
    let totalStock: number;
    if (variantKey && product.variants?.length) {
      const variant = product.variants.find(
        (v: { color: string; size: string }) =>
          v.color === (item.color || "") && v.size === (item.size || "")
      );
      totalStock = variant?.inventory ?? 0;
    } else {
      totalStock = product.inventory ?? 0;
    }

    const availableStock = totalStock - reservedQty;
    if (item.quantity > availableStock) {
      // Rollback any reservations we just created for this session
      await InventoryReservation.deleteMany({ sessionId });
      const label = variantKey
        ? `${product.name} (${item.color || ""}${item.color && item.size ? " / " : ""}${item.size || ""})`
        : product.name;
      return {
        success: false,
        error: `Insufficient stock for ${label}. Only ${Math.max(0, availableStock)} available.`,
      };
    }

    // Create reservation
    await InventoryReservation.create({
      productId: product._id,
      variantKey,
      quantity: item.quantity,
      sessionId,
      expiresAt,
    });
  }

  return { success: true };
}

/**
 * Release all reservations for a session (after successful payment).
 */
export async function releaseReservations(sessionId: string): Promise<void> {
  await connectDB();
  await InventoryReservation.deleteMany({ sessionId });
}
