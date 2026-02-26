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
  ChevronRight,
  ZoomIn,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
          <nav
            className="flex items-center gap-2 text-sm text-muted-fg mb-6"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-heading transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-heading transition-colors">
              Shop
            </Link>
            {product && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-heading transition-colors"
                >
                  {product.category}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-heading truncate max-w-[200px]">
                  {product.name}
                </span>
              </>
            )}
          </nav>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
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
                              {[
                                {
                                  key: "copy",
                                  label: copied ? "Copied!" : "Copy Link",
                                  icon: copied ? Check : Copy,
                                },
                                {
                                  key: "whatsapp",
                                  label: "WhatsApp",
                                  icon: Share2,
                                },
                                {
                                  key: "twitter",
                                  label: "Twitter / X",
                                  icon: Share2,
                                },
                                {
                                  key: "facebook",
                                  label: "Facebook",
                                  icon: Share2,
                                },
                              ].map((item) => (
                                <button
                                  key={item.key}
                                  onClick={() => handleShare(item.key)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-body hover:text-heading hover:bg-[var(--overlay)] rounded-lg transition-colors"
                                >
                                  <item.icon className="w-4 h-4" />
                                  {item.label}
                                </button>
                              ))}
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
                        <Link
                          href="/size-guide"
                          className="text-xs text-neon-violet hover:underline"
                        >
                          Size Guide
                        </Link>
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
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                      added
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                        : product.inStock
                        ? "bg-neon-violet hover:shadow-neon hover:scale-[1.02]"
                        : "bg-gray-500 cursor-not-allowed opacity-50"
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
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </button>

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
                        className="prose prose-invert prose-sm max-w-none prose-p:text-body prose-strong:text-heading prose-li:text-body prose-a:text-neon-violet"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
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
    </PageTransitionProvider>
  );
}


