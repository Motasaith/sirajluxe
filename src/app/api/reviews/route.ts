import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Review } from "@/lib/models/review";
import { Product } from "@/lib/models/product";
import { Order } from "@/lib/models/order";
import { isValidObjectId } from "@/lib/validation";

// GET /api/reviews?productId=xxx — get approved reviews for a product
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId || !isValidObjectId(productId)) {
      return NextResponse.json({ error: "Valid productId is required" }, { status: 400 });
    }

    const reviews = await Review.find({ product: productId, approved: true })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const total = reviews.length;
    const avgRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
    const distribution = [0, 0, 0, 0, 0]; // index 0 = 1-star, etc.
    reviews.forEach((r) => { distribution[r.rating - 1]++; });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r._id.toString(),
        clerkId: r.clerkId,
        userName: r.userName,
        userAvatar: r.userAvatar,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        createdAt: r.createdAt,
      })),
      stats: {
        total,
        average: Math.round(avgRating * 10) / 10,
        distribution,
      },
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews — submit a review (must be signed in)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { productId, rating, title, comment } = body;

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ product: productId, clerkId: userId });
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }

    // Get user details from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonymous";
    const userAvatar = user.imageUrl || "";

    // Check if user has purchased this product (verified review)
    const orders = await Order.find({
      clerkUserId: userId,
      "items.productId": productId,
      paymentStatus: "paid",
    }).limit(1);
    const verified = orders.length > 0;

    const review = await Review.create({
      product: productId,
      clerkId: userId,
      userName,
      userAvatar,
      rating: Math.round(rating),
      title: title.slice(0, 120),
      comment: comment.slice(0, 2000),
      verified,
      approved: false, // requires admin moderation before appearing publicly
    });

    // Update product's aggregate rating
    const allReviews = await Review.find({ product: productId, approved: true });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avg * 10) / 10,
      reviews: allReviews.length,
    });

    return NextResponse.json({
      id: review._id.toString(),
      message: "Review submitted and pending approval",
    }, { status: 201 });
  } catch (error: unknown) {
    // Duplicate key = user already reviewed
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }
    console.error("POST /api/reviews error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
