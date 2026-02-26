import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Wishlist } from "@/lib/models/wishlist";

// GET /api/wishlist — get current user's wishlist
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    await connectDB();
    const wishlist = await Wishlist.findOne({ clerkId: userId })
      .populate("items.product")
      .lean();

    if (!wishlist) {
      return NextResponse.json({ items: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (wishlist.items as any[])
      .filter((item) => item.product)
      .map((item) => {
        const p = item.product;
        return {
          id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
          category: p.category,
          inStock: p.inStock,
          rating: p.rating,
          reviews: p.reviews,
          addedAt: item.addedAt,
        };
      });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/wishlist error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST /api/wishlist — add product to wishlist
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to save items" }, { status: 401 });
    }

    await connectDB();
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ clerkId: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ clerkId: userId, items: [{ product: productId }] });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alreadyExists = (wishlist.items as any[]).some(
        (item) => item.product.toString() === productId
      );
      if (!alreadyExists) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (wishlist.items as any[]).push({ product: productId, addedAt: new Date() });
        await wishlist.save();
      }
    }

    return NextResponse.json({ message: "Added to wishlist" });
  } catch (error) {
    console.error("POST /api/wishlist error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// DELETE /api/wishlist — remove product from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    await connectDB();
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    await Wishlist.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { items: { product: productId } } }
    );

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
