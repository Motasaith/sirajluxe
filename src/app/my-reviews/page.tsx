"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Loader2,
  Pencil,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";

interface UserReview {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

function StarRating({
  rating,
  onChange,
  interactive = false,
}: {
  rating: number;
  onChange?: (r: number) => void;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`w-5 h-5 ${
              i <= (hover || rating)
                ? "text-amber-400 fill-amber-400"
                : "text-[var(--subtle)]"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function ApprovalBadge({ approved }: { approved: boolean }) {
  if (approved) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Clock className="w-3 h-3" />
      Pending Review
    </span>
  );
}

export default function MyReviewsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/my-reviews");
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
      } else {
        setError(data.error || "Failed to load reviews");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchReviews();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, fetchReviews]);

  const startEdit = (review: UserReview) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(5);
    setEditTitle("");
    setEditComment("");
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim() || !editComment.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/my-reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: editingId,
          rating: editRating,
          title: editTitle.trim(),
          comment: editComment.trim(),
        }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? { ...r, rating: editRating, title: editTitle.trim(), comment: editComment.trim(), approved: false }
              : r
          )
        );
        cancelEdit();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update review");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/my-reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete review");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Not signed in
  if (isLoaded && !isSignedIn) {
    return (
      <PageTransitionProvider>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 pt-32">
          <div className="w-16 h-16 rounded-full bg-[var(--overlay)] flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8 text-[var(--subtle)]" />
          </div>
          <h1 className="text-2xl font-bold text-heading mb-2">Sign in to View Reviews</h1>
          <p className="text-[var(--muted)] mb-6 text-center max-w-md">
            Sign in to see and manage all the reviews you&apos;ve written.
          </p>
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-gradient-to-r from-neon-violet to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-neon-violet/25 transition-all"
          >
            Sign In
          </Link>
        </main>
        <Footer />
      </PageTransitionProvider>
    );
  }

  return (
    <PageTransitionProvider>
      <Header />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-heading mb-2">My Reviews</h1>
            <p className="text-[var(--muted)]">
              Manage all the reviews you&apos;ve written across the store.
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
              <button onClick={() => setError("")} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin mb-4" />
              <p className="text-[var(--muted)]">Loading your reviews...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && reviews.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--overlay)] flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-[var(--subtle)]" />
              </div>
              <h2 className="text-xl font-semibold text-heading mb-2">No Reviews Yet</h2>
              <p className="text-[var(--muted)] mb-6 text-center max-w-md">
                You haven&apos;t written any reviews yet. Browse products and share your thoughts!
              </p>
              <Link
                href="/shop"
                className="px-6 py-3 bg-gradient-to-r from-neon-violet to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-neon-violet/25 transition-all"
              >
                Browse Products
              </Link>
            </motion.div>
          )}

          {/* Reviews list */}
          {!loading && reviews.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)] mb-2">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
              <AnimatePresence mode="popLayout">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl overflow-hidden"
                  >
                    {/* Review header with product info */}
                    <div className="flex items-start gap-4 p-5">
                      {/* Product image */}
                      <Link
                        href={review.productSlug ? `/shop/${review.productSlug}` : "#"}
                        className="shrink-0"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[var(--overlay)]">
                          {review.productImage ? (
                            <Image
                              src={review.productImage}
                              alt={review.productName}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--subtle)]">
                              <MessageSquare className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product name + rating + badges */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={review.productSlug ? `/shop/${review.productSlug}` : "#"}
                          className="text-sm font-medium text-heading hover:text-neon-violet transition-colors line-clamp-1"
                        >
                          {review.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <StarRating rating={review.rating} />
                          <ApprovalBadge approved={review.approved} />
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                              <ShieldCheck className="w-3 h-3" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {new Date(review.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {review.updatedAt !== review.createdAt && " (edited)"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(review)}
                          className="p-2 rounded-lg text-[var(--muted)] hover:text-heading hover:bg-[var(--hover)] transition-all"
                          title="Edit review"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(review.id)}
                          className="p-2 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Review content or edit form */}
                    {editingId === review.id ? (
                      <div className="px-5 pb-5 border-t border-[var(--border)] pt-4 space-y-4">
                        <div>
                          <label className="text-xs font-medium text-[var(--muted)] block mb-2">Rating</label>
                          <StarRating rating={editRating} onChange={setEditRating} interactive />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--muted)] block mb-1">Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            maxLength={120}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--overlay)] border border-[var(--border)] text-heading text-sm focus:outline-none focus:border-neon-violet/50 focus:ring-2 focus:ring-neon-violet/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--muted)] block mb-1">Comment</label>
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            maxLength={2000}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--overlay)] border border-[var(--border)] text-heading text-sm focus:outline-none focus:border-neon-violet/50 focus:ring-2 focus:ring-neon-violet/20 transition-all resize-none"
                          />
                        </div>
                        <p className="text-xs text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Edited reviews are re-submitted for moderation.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving || !editTitle.trim() || !editComment.trim()}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-violet to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-violet/25 transition-all disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-sm hover:text-heading hover:bg-[var(--hover)] transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 pb-5">
                        <h3 className="text-sm font-semibold text-heading mb-1">{review.title}</h3>
                        <p className="text-sm text-body leading-relaxed">{review.comment}</p>
                      </div>
                    )}

                    {/* Delete confirmation */}
                    <AnimatePresence>
                      {confirmDeleteId === review.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-red-500/20 bg-red-500/5 overflow-hidden"
                        >
                          <div className="p-4 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-sm text-red-400 flex-1">
                              Delete this review permanently?
                            </p>
                            <button
                              onClick={() => deleteReview(review.id)}
                              disabled={deletingId === review.id}
                              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {deletingId === review.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs hover:text-heading transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
