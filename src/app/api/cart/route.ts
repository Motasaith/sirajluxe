import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Cart } from "@/lib/models";

// GET /api/cart — get server-side cart for logged-in user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ items: [] });
  }

  await connectDB();
  const cart = await Cart.findOne({ clerkUserId: userId }).lean();
  return NextResponse.json({ items: cart?.items || [] });
}

// PUT /api/cart — sync client cart to server
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: true }); // Guest — no server sync
  }

  try {
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    // Limit cart to 50 items to prevent abuse
    const safeItems = items.slice(0, 50).map((item: Record<string, unknown>) => ({
      productId: String(item.productId || ""),
      name: String(item.name || "").slice(0, 200),
      price: Number(item.price) || 0,
      image: String(item.image || "").slice(0, 500),
      quantity: Math.min(Math.max(1, Number(item.quantity) || 1), 99),
      color: String(item.color || "").slice(0, 50),
      size: String(item.size || "").slice(0, 50),
    }));

    await connectDB();

    // Get user email from Clerk for abandoned cart emails
    let email = "";
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      email = user.emailAddresses?.[0]?.emailAddress || "";
    } catch {
      // email not available — not critical
    }

    await Cart.findOneAndUpdate(
      { clerkUserId: userId },
      {
        items: safeItems,
        email,
        // Reset abandoned email flag if cart was updated (user is active)
        ...(safeItems.length > 0 ? { abandonedEmailSent: false } : {}),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}

// DELETE /api/cart — clear server-side cart
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: true });
  }

  await connectDB();
  await Cart.findOneAndUpdate(
    { clerkUserId: userId },
    { items: [], abandonedEmailSent: false }
  );

  return NextResponse.json({ success: true });
}
