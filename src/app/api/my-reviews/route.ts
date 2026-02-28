import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { Review } from "@/lib/models/review";
import { Product } from "@/lib/models/product";
import { isValidObjectId } from "@/lib/validation";
import { rateLimit, getIP } from "@/lib/rate-limit";

// GET /api/my-reviews — get all reviews by the current user
export async function GET(req: NextRequest) {
  try {
    const { allowed } = rateLimit(`my-reviews:${getIP(req)}`, { limit: 30, windowSec: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to view your reviews" }, { status: 401 });
    }

    await connectDB();
    const reviews = await Review.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch product details for each review
    const productIds = [...new Set(reviews.map((r) => r.product.toString()))];
    const products = await Product.find({ _id: { $in: productIds } })
      .select("name slug images")
      .lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const mapped = reviews.map((r) => {
      const product = productMap.get(r.product.toString());
      return {
        id: r._id.toString(),
        productId: r.product.toString(),
        productName: product?.name || "Unknown Product",
        productSlug: product?.slug || "",
        productImage: product?.images?.[0] || "",
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        approved: r.approved,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return NextResponse.json({ reviews: mapped });
  } catch (error) {
    console.error("GET /api/my-reviews error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// PUT /api/my-reviews — update a review (only by the owner)
export async function PUT(req: NextRequest) {
  try {
    const { allowed } = rateLimit(`my-reviews-edit:${getIP(req)}`, { limit: 10, windowSec: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to edit your review" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { reviewId, rating, title, comment } = body;

    if (!reviewId || !isValidObjectId(reviewId)) {
      return NextResponse.json({ error: "Valid reviewId is required" }, { status: 400 });
    }

    if (!rating || !title || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const review = await Review.findOne({ _id: reviewId, clerkId: userId });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    review.rating = Math.round(rating);
    review.title = title.slice(0, 120);
    review.comment = comment.slice(0, 2000);
    review.approved = false; // Re-submit for moderation after edit
    await review.save();

    // Update product's aggregate rating
    const allApproved = await Review.find({ product: review.product, approved: true });
    if (allApproved.length > 0) {
      const avg = allApproved.reduce((s, r) => s + r.rating, 0) / allApproved.length;
      await Product.findByIdAndUpdate(review.product, {
        rating: Math.round(avg * 10) / 10,
        reviews: allApproved.length,
      });
    }

    return NextResponse.json({ message: "Review updated and pending re-approval" });
  } catch (error) {
    console.error("PUT /api/my-reviews error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE /api/my-reviews — delete a review (only by the owner)
export async function DELETE(req: NextRequest) {
  try {
    const { allowed } = rateLimit(`my-reviews-del:${getIP(req)}`, { limit: 10, windowSec: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to delete your review" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId || !isValidObjectId(reviewId)) {
      return NextResponse.json({ error: "Valid reviewId is required" }, { status: 400 });
    }

    const review = await Review.findOneAndDelete({ _id: reviewId, clerkId: userId });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update product's aggregate rating
    const allApproved = await Review.find({ product: review.product, approved: true });
    if (allApproved.length > 0) {
      const avg = allApproved.reduce((s, r) => s + r.rating, 0) / allApproved.length;
      await Product.findByIdAndUpdate(review.product, {
        rating: Math.round(avg * 10) / 10,
        reviews: allApproved.length,
      });
    } else {
      await Product.findByIdAndUpdate(review.product, { rating: 0, reviews: 0 });
    }

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("DELETE /api/my-reviews error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
