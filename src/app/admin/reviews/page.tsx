"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Star,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
  };
  clerkId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = () => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAction = async (
    reviewId: string,
    action: "approve" | "reject" | "delete"
  ) => {
    setActionLoading(reviewId);
    try {
      if (action === "delete") {
        await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
          method: "DELETE",
        });
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      } else {
        const res = await fetch("/api/admin/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewId,
            approved: action === "approve",
          }),
        });
        if (res.ok) {
          setReviews((prev) =>
            prev.map((r) =>
              r._id === reviewId
                ? { ...r, approved: action === "approve" }
                : r
            )
          );
        }
      }
    } catch (e) {
      console.error("Review action failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "approved") return r.approved;
    if (filter === "rejected") return !r.approved;
    if (filter === "pending") return r.approved; // all auto-approve, so pending = approved but could be a different logic
    return true;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.approved).length,
    rejected: reviews.filter((r) => !r.approved).length,
    avgRating:
      reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "—",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage customer reviews and ratings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Reviews", value: stats.total, icon: MessageSquare },
          { label: "Approved", value: stats.approved, icon: CheckCircle2 },
          { label: "Rejected", value: stats.rejected, icon: XCircle },
          { label: "Avg Rating", value: stats.avgRating, icon: Star },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#111] border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-violet-600 text-white"
                : "bg-[#111] border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div
              key={review._id}
              className="bg-[#111] border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-white text-sm">
                      {review.userName}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                        Verified
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        review.approved
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {review.approved ? "Approved" : "Rejected"}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-white font-semibold text-sm">
                      {review.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {review.comment}
                    </p>
                  </div>

                  {review.product && (
                    <Link
                      href={`/shop/${review.product.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:underline"
                    >
                      {review.product.name}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {actionLoading === review._id ? (
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  ) : (
                    <>
                      {!review.approved && (
                        <button
                          onClick={() =>
                            handleAction(review._id, "approve")
                          }
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {review.approved && (
                        <button
                          onClick={() =>
                            handleAction(review._id, "reject")
                          }
                          className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleAction(review._id, "delete")
                        }
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
