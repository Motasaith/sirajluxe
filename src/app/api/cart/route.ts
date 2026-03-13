import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Cart } from "@/lib/models";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const sessionId = req.headers.get("x-session-id");

  if (!userId && !sessionId) {
    return NextResponse.json({ items: [] });
  }

  await connectDB();
  let cart = null;
  
  if (userId) {
    cart = await Cart.findOne({ clerkUserId: userId }).lean();
    if (!cart && sessionId) {
      // Migrate guest cart if exists
      cart = await Cart.findOne({ sessionId, clerkUserId: { $exists: false } }).lean();
      if (cart) {
        await Cart.findByIdAndUpdate(cart._id, { clerkUserId: userId });
      }
    }
  } else if (sessionId) {
    cart = await Cart.findOne({ sessionId, clerkUserId: { $exists: false } }).lean();
  }

  return NextResponse.json({ items: cart?.items || [] });
}

// PUT /api/cart — sync client cart to server
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  const sessionId = req.headers.get("x-session-id");
  
  if (!userId && !sessionId) {
    return NextResponse.json({ success: true });
  }

  const identifier = userId || sessionId || getIP(req);
  const { allowed } = rateLimit(`cart_sync_${identifier}`, { limit: 30, windowSec: 60 });
  
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { items, email: guestEmail } = await req.json();

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

    let email = guestEmail || "";
    if (userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        email = user.emailAddresses?.[0]?.emailAddress || email;
      } catch {
        // email not available — not critical
      }
    }

    const query = userId ? { clerkUserId: userId } : { sessionId };
    
    await Cart.findOneAndUpdate(
      query,
      {
        items: safeItems,
        email,
        ...(userId ? { clerkUserId: userId } : { sessionId }),
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
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  const sessionId = req.headers.get("x-session-id");
  
  if (!userId && !sessionId) {
    return NextResponse.json({ success: true });
  }

  await connectDB();
  const query = userId ? { clerkUserId: userId } : { sessionId };
  
  await Cart.findOneAndUpdate(
    query,
    { items: [], abandonedEmailSent: false }
  );

  return NextResponse.json({ success: true });
}
