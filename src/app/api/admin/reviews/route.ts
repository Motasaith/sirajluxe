import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Review } from "@/lib/models/review";
import { Product } from "@/lib/models/product";
import { adminGuard } from "@/lib/admin-auth";
import { isValidObjectId } from "@/lib/validation";

// GET /api/admin/reviews — list all reviews (admin)
export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await connectDB();
    const reviews = await Review.find()
      .populate("product", "name slug image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviews: reviews.map((r: any) => ({
        id: r._id.toString(),
        product: r.product
          ? {
              id: r.product._id.toString(),
              name: r.product.name,
              slug: r.product.slug,
              image: r.product.image,
            }
          : null,
        clerkId: r.clerkId,
        userName: r.userName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        approved: r.approved,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// PATCH /api/admin/reviews — approve/reject a review
export async function PATCH(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await connectDB();
    const { reviewId, approved } = await req.json();

    if (!isValidObjectId(reviewId)) {
      return NextResponse.json({ error: "Valid reviewId required" }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { approved: !!approved },
      { returnDocument: 'after' }
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Recalculate product rating
    const allApproved = await Review.find({ product: review.product, approved: true });
    const avg = allApproved.length > 0
      ? allApproved.reduce((s, r) => s + r.rating, 0) / allApproved.length
      : 0;
    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avg * 10) / 10,
      reviews: allApproved.length,
    });

    return NextResponse.json({ message: "Review updated" });
  } catch (error) {
    console.error("PATCH /api/admin/reviews error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE /api/admin/reviews — delete a review
export async function DELETE(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await connectDB();

    // Support both query param and JSON body for reviewId
    const url = new URL(req.url);
    let reviewId = url.searchParams.get("reviewId");
    if (!reviewId) {
      const body = await req.json().catch(() => ({}));
      reviewId = body.reviewId || null;
    }

    if (!reviewId || !isValidObjectId(reviewId)) {
      return NextResponse.json({ error: "Valid reviewId required" }, { status: 400 });
    }

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Recalculate product rating
    const allApproved = await Review.find({ product: review.product, approved: true });
    const avg = allApproved.length > 0
      ? allApproved.reduce((s, r) => s + r.rating, 0) / allApproved.length
      : 0;
    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avg * 10) / 10,
      reviews: allApproved.length,
    });

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/reviews error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
