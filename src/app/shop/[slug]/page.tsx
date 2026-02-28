"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/ui/toast";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { useUser } from "@clerk/nextjs";
import {
  ShoppingBag,
  Heart,
  Star,
  Minus,
  Plus,
  Loader2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Share2,
  ZoomIn,
  Copy,
  CheckCircle2,
  AlertCircle,
  MessageCircleQuestion,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import { SizeGuideModal } from "@/components/ui/size-guide-modal";
import { blurDataURL } from "@/lib/blur-placeholder";

/* ─── types ─── */
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags?: { tag: string }[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  image: string;
  images?: { url: string }[];
  colors?: { color: string }[];
  sizes?: { size: string }[];
  inventory: number;
}

interface Review {
  id: string;
  clerkId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
}

interface ReviewStats {
  total: number;
  average: number;
  distribution: number[];
}

/* ─── Recently Viewed helper ─── */
const RECENT_KEY = "sirajluxe-recent";
const MAX_RECENT = 8;

function addToRecentlyViewed(product: Product) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = stored.filter((p: Record<string, unknown>) => p.id !== product.id);
    filtered.unshift({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      rating: product.rating,
    });
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(filtered.slice(0, MAX_RECENT))
    );
  } catch {
    /* ignore */
  }
}

function getRecentlyViewed(excludeId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stored.filter((p: Record<string, unknown>) => p.id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

/* ─── Main Page ─── */
export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isSignedIn } = useUser();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [stockAlertEmail, setStockAlertEmail] = useState("");
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockAlertSent, setStockAlertSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );

  // Image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    total: 0,
    average: 0,
    distribution: [0, 0, 0, 0, 0],
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Related & recently viewed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [relatedProducts, setRelatedProducts] = useState<Record<string, any>[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentlyViewed, setRecentlyViewed] = useState<Record<string, any>[]>([]);

  // Share
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Q&A
  const [questions, setQuestions] = useState<{ id: string; userName: string; question: string; answer: string | null; answeredAt: string | null; createdAt: string }[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [questionSuccess, setQuestionSuccess] = useState(false);

  // All images for gallery
  const allImages = product
    ? [product.image, ...(product.images?.map((img) => img.url) || [])].filter(
        Boolean
      )
    : [];

  /* ── Fetch product ── */
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?slug=${encodeURIComponent(slug)}&limit=1`
        );
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const match = data.docs[0];
          setProduct(match);
          if (match.colors?.length > 0) setSelectedColor(match.colors[0].color);
          if (match.sizes?.length > 0) setSelectedSize(match.sizes[0].size);
          addToRecentlyViewed(match);
          fetchRelated(match.category, match.id);
          fetchReviews(match.id);
          fetchQuestions(match.id);
        }
      } catch (e) {
        console.error("Failed to load product:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product) {
      setRecentlyViewed(getRecentlyViewed(product.id));
    }
  }, [product]);

  const fetchRelated = async (category: string, excludeId: string) => {
    try {
      const res = await fetch(
        `/api/products?category=${encodeURIComponent(category)}&limit=5`
      );
      const data = await res.json();
      setRelatedProducts(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.docs || []).filter((p: Record<string, any>) => p.id !== excludeId).slice(0, 4)
      );
    } catch {
      /* ignore */
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setReviewStats(
        data.stats || { total: 0, average: 0, distribution: [0, 0, 0, 0, 0] }
      );
    } catch {
      /* ignore */
    }
  };

  const fetchQuestions = async (productId: string) => {
    try {
      const res = await fetch(`/api/questions?productId=${productId}`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      /* ignore */
    }
  };

  const handleAskQuestion = async () => {
    if (!product || !questionText.trim()) return;
    setQuestionSubmitting(true);
    setQuestionError("");
    setQuestionSuccess(false);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, question: questionText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQuestionError(data.error || "Failed to submit question");
        return;
      }
      setQuestionSuccess(true);
      setQuestionText("");
      setShowQuestionForm(false);
      fetchQuestions(product.id);
    } catch {
      setQuestionError("Something went wrong. Please try again.");
    } finally {
      setQuestionSubmitting(false);
    }
  };

  /* ── Handlers ── */
  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      },
      quantity
    );
    toast({ title: "Added to bag", description: product.name, variant: "success" });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess(false);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Failed to submit review");
      } else {
        setReviewSuccess(true);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: "", comment: "" });
        fetchReviews(product.id);
      }
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = product?.name || "Check out this product";

    switch (platform) {
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
    }
    setShowShareMenu(false);
  };

  const discountPercent = product?.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <PageTransitionProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Breadcrumbs */}
          {product && (
            <Breadcrumbs
              items={[
                { label: "Shop", href: "/shop" },
                { label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` },
                { label: product.name },
              ]}
            />
          )}

          {loading ? (
            <ProductDetailSkeleton />
          ) : !product ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto">
              <p className="text-heading font-semibold mb-2">
                Product not found
              </p>
              <p className="text-sm text-muted-fg mb-6">
                This product may no longer be available.
              </p>
              <Link
                href="/shop"
                className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              {/* JSON-LD Structured Data */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: product.name,
                    image: allImages.length > 0 ? allImages : product.image,
                    description: product.description?.replace(/<[^>]*>/g, ""),
                    brand: {
                      "@type": "Brand",
                      name: "Siraj Luxe",
                    },
                    sku: product.id,
                    offers: {
                      "@type": "Offer",
                      price: product.price,
                      priceCurrency: "GBP",
                      availability: product.inStock
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com"}/shop/${product.slug}`,
                    },
                    ...(reviewStats.total > 0
                      ? {
                          aggregateRating: {
                            "@type": "AggregateRating",
                            ratingValue: reviewStats.average,
                            reviewCount: reviewStats.total,
                          },
                        }
                      : product.rating
                        ? {
                            aggregateRating: {
                              "@type": "AggregateRating",
                              ratingValue: product.rating,
                              reviewCount: product.reviews || 1,
                            },
                          }
                        : {}),
                  }),
                }}
              />

              <div className="grid lg:grid-cols-2 gap-12">
                {/* ─── Left: Image Gallery + Zoom ─── */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Main Image with Zoom */}
                  <div
                    ref={imageRef}
                    className="glass-card overflow-hidden aspect-square relative cursor-zoom-in group"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setShowZoom(true)}
                    onMouseLeave={() => setShowZoom(false)}
                    onClick={() => setShowZoom(false)}
                  >
                    {allImages[selectedImageIndex] ? (
                      <>
                        <Image
                          src={allImages[selectedImageIndex]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority
                          placeholder="blur"
                          blurDataURL={blurDataURL}
                        />
                        {/* Zoom lens overlay */}
                        {showZoom && (
                          <div
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{
                              backgroundImage: `url(${allImages[selectedImageIndex]})`,
                              backgroundSize: "200%",
                              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                              opacity: 1,
                            }}
                          />
                        )}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <span className="px-3 py-1.5 rounded-full glass text-xs text-muted-fg flex items-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5" /> Hover to zoom
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-neon-violet/20 to-neon-purple/10 blur-3xl" />
                        <span className="absolute text-[10rem] font-display font-bold text-heading/5">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="absolute top-6 left-6 flex gap-2 z-20">
                      {product.tags?.map((t) => (
                        <span
                          key={t.tag}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                            t.tag === "Sale" || t.tag === "Hot"
                              ? "bg-red-500/20 text-red-300 border border-red-500/20"
                              : t.tag === "New" || t.tag === "Limited"
                              ? "bg-neon-violet/20 text-neon-glow border border-neon-violet/20"
                              : "bg-[var(--overlay-strong)] text-body border border-[var(--border-strong)]"
                          }`}
                        >
                          {t.tag}
                        </span>
                      ))}
                    </div>

                    {/* Wishlist + Share */}
                    <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            isInWishlist(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-body hover:text-heading"
                          }`}
                        />
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowShareMenu(!showShareMenu);
                          }}
                          className="w-10 h-10 rounded-full glass flex items-center justify-center text-body hover:text-heading transition-all hover:scale-110"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                          {showShareMenu && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -5 }}
                              className="absolute right-0 top-12 glass-card p-2 rounded-xl z-50 min-w-[160px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleShare("copy")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-body hover:text-heading hover:bg-[var(--overlay)] rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                                {copied ? "Copied!" : "Copy Link"}
                              </button>
                              <button
                                onClick={() => handleShare("whatsapp")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-body hover:text-heading hover:bg-[var(--overlay)] rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                              </button>
                              <button
                                onClick={() => handleShare("twitter")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-body hover:text-heading hover:bg-[var(--overlay)] rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                X / Twitter
                              </button>
                              <button
                                onClick={() => handleShare("facebook")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-body hover:text-heading hover:bg-[var(--overlay)] rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Facebook
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Low stock badge */}
                    {product.inventory > 0 && product.inventory <= 5 && (
                      <div className="absolute bottom-6 left-6 z-20">
                        <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/20 backdrop-blur-md">
                          Only {product.inventory} left
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                            selectedImageIndex === idx
                              ? "border-neon-violet shadow-neon"
                              : "border-[var(--border)] hover:border-[var(--accent)] opacity-60 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* ─── Right: Product Info ─── */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-col"
                >
                  <p className="text-sm font-medium tracking-wider uppercase text-subtle-fg mb-3">
                    {product.category}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-heading mb-4">
                    {product.name}
                  </h1>

                  {/* Rating summary */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <
                            Math.floor(reviewStats.average || product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-subtle-fg"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className="text-sm text-muted-fg hover:text-neon-violet transition-colors"
                    >
                      {reviewStats.total > 0
                        ? `${reviewStats.average} (${reviewStats.total} review${reviewStats.total !== 1 ? "s" : ""})`
                        : "No reviews yet — be the first!"}
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-heading">
                      £{product.price}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-lg text-subtle-fg line-through">
                          £{product.originalPrice}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
                          -{discountPercent}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-heading mb-3">
                        Colour{" "}
                        {selectedColor && (
                          <span className="text-muted-fg font-normal">
                            — {selectedColor}
                          </span>
                        )}
                      </p>
                      <div className="flex gap-3">
                        {product.colors.map((c) => (
                          <button
                            key={c.color}
                            onClick={() => setSelectedColor(c.color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                              selectedColor === c.color
                                ? "border-neon-violet scale-110"
                                : "border-[var(--border-strong)] hover:border-[var(--accent)]"
                            }`}
                            style={{ backgroundColor: c.color }}
                            aria-label={`Select colour ${c.color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-heading">
                          Size{" "}
                          {selectedSize && (
                            <span className="text-muted-fg font-normal">
                              — {selectedSize}
                            </span>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowSizeGuide(true)}
                          className="text-xs text-neon-violet hover:underline"
                        >
                          Size Guide
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s) => (
                          <button
                            key={s.size}
                            onClick={() => setSelectedSize(s.size)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                              selectedSize === s.size
                                ? "bg-neon-violet text-white shadow-neon"
                                : "glass text-body hover:text-heading hover:border-[var(--accent)]"
                            }`}
                          >
                            {s.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-heading mb-3">
                      Quantity
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl glass flex items-center justify-center text-body hover:text-heading"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-14 text-center text-lg font-semibold text-heading">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(product.inventory || 99, quantity + 1)
                          )
                        }
                        className="w-10 h-10 rounded-xl glass flex items-center justify-center text-body hover:text-heading"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="ml-4 text-sm text-subtle-fg">
                        {product.inventory > 0
                          ? `${product.inventory} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  {product.inStock ? (
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                        added
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                          : "bg-neon-violet hover:shadow-neon hover:scale-[1.02]"
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-5 h-5" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-full py-4 rounded-2xl bg-gray-500 text-white font-semibold text-lg flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                        <ShoppingBag className="w-5 h-5" />
                        Out of Stock
                      </div>
                      {stockAlertSent ? (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          We&apos;ll notify you when it&apos;s back!
                        </div>
                      ) : (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setStockAlertLoading(true);
                            try {
                              const res = await fetch("/api/stock-alerts", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  email: stockAlertEmail,
                                  productId: product.id,
                                  productName: product.name,
                                }),
                              });
                              if (res.ok) {
                                setStockAlertSent(true);
                                toast({
                                  title: "Alert registered!",
                                  description: "We'll email you when this item is back in stock.",
                                  variant: "success",
                                });
                              } else {
                                const data = await res.json();
                                toast({
                                  title: "Error",
                                  description: data.error || "Something went wrong.",
                                  variant: "error",
                                });
                              }
                            } catch {
                              toast({
                                title: "Error",
                                description: "Failed to register alert. Please try again.",
                                variant: "error",
                              });
                            } finally {
                              setStockAlertLoading(false);
                            }
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="email"
                            required
                            value={stockAlertEmail}
                            onChange={(e) => setStockAlertEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-2xl glass text-sm text-body placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-neon-violet/50"
                          />
                          <button
                            type="submit"
                            disabled={stockAlertLoading}
                            className="px-5 py-3 rounded-2xl bg-neon-violet text-white text-sm font-semibold hover:shadow-neon transition-all disabled:opacity-50"
                          >
                            {stockAlertLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Notify Me"
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Wishlist button (text) */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="mt-3 w-full py-3 rounded-2xl border border-[var(--border)] text-body hover:text-heading hover:border-neon-violet font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isInWishlist(product.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    {isInWishlist(product.id)
                      ? "Saved to Wishlist"
                      : "Add to Wishlist"}
                  </button>

                  {/* Perks */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[var(--border)]">
                    <div className="flex flex-col items-center text-center gap-2">
                      <Truck className="w-5 h-5 text-neon-violet" />
                      <span className="text-xs text-muted-fg">
                        Free Shipping
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                      <Shield className="w-5 h-5 text-neon-violet" />
                      <span className="text-xs text-muted-fg">
                        2 Year Warranty
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                      <RotateCcw className="w-5 h-5 text-neon-violet" />
                      <span className="text-xs text-muted-fg">
                        30-Day Returns
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ─── Tabs: Description / Reviews ─── */}
              <div className="mt-16">
                <div className="flex gap-1 border-b border-[var(--border)]">
                  {(["description", "reviews"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                        activeTab === tab
                          ? "text-heading border-neon-violet"
                          : "text-muted-fg border-transparent hover:text-heading"
                      }`}
                    >
                      {tab === "reviews"
                        ? `Reviews (${reviewStats.total})`
                        : "Description"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "description" ? (
                    <motion.div
                      key="desc"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="py-8"
                    >
                      <div
                        className="prose dark:prose-invert prose-sm max-w-none prose-p:text-body prose-strong:text-heading prose-li:text-body prose-a:text-neon-violet"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(product.description),
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="py-8"
                    >
                      {/* Rating overview */}
                      <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="glass-card p-6 text-center">
                          <p className="text-5xl font-bold text-heading mb-2">
                            {reviewStats.average || "—"}
                          </p>
                          <div className="flex justify-center gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(reviewStats.average)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-subtle-fg"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-fg">
                            Based on {reviewStats.total} review
                            {reviewStats.total !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="glass-card p-6 space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count =
                              reviewStats.distribution[star - 1] || 0;
                            const pct =
                              reviewStats.total > 0
                                ? (count / reviewStats.total) * 100
                                : 0;
                            return (
                              <div
                                key={star}
                                className="flex items-center gap-3"
                              >
                                <span className="text-sm text-muted-fg w-8">
                                  {star}★
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-[var(--overlay)]">
                                  <div
                                    className="h-full rounded-full bg-amber-400 transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-fg w-8">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Write review button */}
                      <div className="mb-8">
                        {!isSignedIn ? (
                          <p className="text-sm text-muted-fg">
                            <Link
                              href="/sign-in"
                              className="text-neon-violet hover:underline"
                            >
                              Sign in
                            </Link>{" "}
                            to write a review.
                          </p>
                        ) : (
                          <button
                            onClick={() =>
                              setShowReviewForm(!showReviewForm)
                            }
                            className="px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
                          >
                            {showReviewForm ? "Cancel" : "Write a Review"}
                          </button>
                        )}

                        {reviewSuccess && (
                          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Your review has been submitted!
                          </div>
                        )}
                      </div>

                      {/* Review form */}
                      <AnimatePresence>
                        {showReviewForm && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleSubmitReview}
                            className="glass-card p-6 mb-8 space-y-4 overflow-hidden"
                          >
                            <div>
                              <label className="text-sm font-medium text-heading block mb-2">
                                Rating
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      setReviewForm({
                                        ...reviewForm,
                                        rating: star,
                                      })
                                    }
                                    className="p-1"
                                  >
                                    <Star
                                      className={`w-7 h-7 transition-colors ${
                                        star <= reviewForm.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-subtle-fg hover:text-amber-400/50"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-heading block mb-2">
                                Title
                              </label>
                              <input
                                type="text"
                                required
                                maxLength={120}
                                value={reviewForm.title}
                                onChange={(e) =>
                                  setReviewForm({
                                    ...reviewForm,
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Summarise your experience"
                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg text-sm focus:outline-none focus:border-neon-violet"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-heading block mb-2">
                                Review
                              </label>
                              <textarea
                                required
                                maxLength={2000}
                                rows={4}
                                value={reviewForm.comment}
                                onChange={(e) =>
                                  setReviewForm({
                                    ...reviewForm,
                                    comment: e.target.value,
                                  })
                                }
                                placeholder="Tell others what you think..."
                                className="w-full px-4 py-2.5 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg text-sm focus:outline-none focus:border-neon-violet resize-none"
                              />
                            </div>

                            {reviewError && (
                              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {reviewError}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={reviewSubmitting}
                              className="px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all disabled:opacity-50"
                            >
                              {reviewSubmitting
                                ? "Submitting..."
                                : "Submit Review"}
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      {/* Reviews list */}
                      {reviews.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                          <p className="text-muted-fg text-sm">
                            No reviews yet. Be the first to share your
                            experience!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div key={review.id} className="glass-card p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[var(--overlay)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {review.userAvatar ? (
                                    <Image
                                      src={review.userAvatar}
                                      alt={review.userName}
                                      width={40}
                                      height={40}
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-bold text-heading">
                                      {review.userName
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-heading text-sm">
                                      {review.userName}
                                    </span>
                                    {review.verified && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                                        Verified Purchase
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3.5 h-3.5 ${
                                            i < review.rating
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-subtle-fg"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-muted-fg">
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-heading text-sm mb-1">
                                    {review.title}
                                  </h4>
                                  <p className="text-body text-sm leading-relaxed">
                                    {review.comment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Q&A Section ─── */}
              <section className="mt-24">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-heading flex items-center gap-3">
                    <MessageCircleQuestion className="w-6 h-6 text-neon-violet" />
                    Questions & Answers
                    {questions.length > 0 && (
                      <span className="text-base font-normal text-muted-fg">({questions.length})</span>
                    )}
                  </h2>
                  {isSignedIn && (
                    <button
                      onClick={() => { setShowQuestionForm(!showQuestionForm); setQuestionError(""); setQuestionSuccess(false); }}
                      className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-heading hover:bg-[var(--hover)] transition-all"
                    >
                      Ask a Question
                    </button>
                  )}
                </div>

                {/* Ask form */}
                <AnimatePresence>
                  {showQuestionForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-6"
                    >
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6 space-y-4">
                        {questionError && (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {questionError}
                          </div>
                        )}
                        <textarea
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          maxLength={500}
                          rows={3}
                          placeholder="What would you like to know about this product?"
                          className="w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading text-sm focus:outline-none focus:border-neon-violet/50 focus:ring-2 focus:ring-neon-violet/20 transition-all resize-none placeholder:text-subtle-fg"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-subtle-fg">{questionText.length}/500</span>
                          <button
                            onClick={handleAskQuestion}
                            disabled={questionSubmitting || questionText.trim().length < 5}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-violet to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-violet/25 transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {questionSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Submit Question
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {questionSuccess && (
                  <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Your question has been submitted! We&apos;ll respond soon.
                  </div>
                )}

                {!isSignedIn && (
                  <div className="mb-6 text-sm text-muted-fg">
                    <Link href="/sign-in" className="text-neon-violet hover:underline">Sign in</Link> to ask a question about this product.
                  </div>
                )}

                {/* Questions list */}
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-5">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-neon-violet font-bold text-sm mt-0.5">Q:</span>
                          <div className="flex-1">
                            <p className="text-sm text-heading font-medium">{q.question}</p>
                            <p className="text-xs text-subtle-fg mt-1">
                              Asked by {q.userName} · {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        {q.answer && (
                          <div className="flex items-start gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                            <span className="text-emerald-400 font-bold text-sm mt-0.5">A:</span>
                            <div className="flex-1">
                              <p className="text-sm text-body">{q.answer}</p>
                              <p className="text-xs text-subtle-fg mt-1 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Siraj Luxe · {q.answeredAt ? new Date(q.answeredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                              </p>
                            </div>
                          </div>
                        )}
                        {!q.answer && (
                          <p className="text-xs text-subtle-fg mt-2 ml-6 italic">Awaiting response from Siraj Luxe</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-fg text-sm">
                    No questions yet. Be the first to ask!
                  </div>
                )}
              </section>

              {/* ─── Related Products ─── */}
              {relatedProducts.length > 0 && (
                <section className="mt-24">
                  <h2 className="text-2xl font-bold text-heading mb-8">You May Also Like</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((p) => (
                      <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--overlay)] mb-3">
                          <Image
                            src={p.images?.[0]?.url || p.image || "/placeholder.jpg"}
                            alt={p.name}
                            width={300}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                          />
                        </div>
                        <h3 className="text-sm font-medium text-heading truncate group-hover:text-neon-violet transition-colors">{p.name}</h3>
                        <p className="text-sm text-muted-fg">
                          {p.originalPrice ? (
                            <>
                              <span className="line-through mr-2">£{p.originalPrice?.toFixed(2)}</span>
                              <span className="text-heading font-semibold">£{p.price?.toFixed(2)}</span>
                            </>
                          ) : (
                            <span>£{p.price?.toFixed(2)}</span>
                          )}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ─── Recently Viewed ─── */}
              {recentlyViewed.length > 0 && (
                <section className="mt-24">
                  <h2 className="text-2xl font-bold text-heading mb-8">Recently Viewed</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {recentlyViewed.map((p) => (
                      <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--overlay)] mb-3">
                          <Image
                            src={p.images?.[0]?.url || p.image || "/placeholder.jpg"}
                            alt={p.name}
                            width={300}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                          />
                        </div>
                        <h3 className="text-sm font-medium text-heading truncate group-hover:text-neon-violet transition-colors">{p.name}</h3>
                        <p className="text-sm text-muted-fg">£{p.price?.toFixed(2)}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </PageTransitionProvider>
  );
}


