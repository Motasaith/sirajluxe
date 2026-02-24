"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import {
  ShoppingBag,
  Heart,
  Star,
  Minus,
  Plus,
  Loader2,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Check,
} from "lucide-react";
import Link from "next/link";

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

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0`);
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const match = data.docs[0];
          setProduct(match);
          if (match.colors?.length > 0) setSelectedColor(match.colors[0].color);
        }
      } catch (e) {
        console.error("Failed to load product:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        color: selectedColor || undefined,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discountPercent =
    product?.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <PageTransitionProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Back Link */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-heading transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : !product ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto">
              <p className="text-heading font-semibold mb-2">Product not found</p>
              <p className="text-sm text-muted-fg mb-6">This product may no longer be available.</p>
              <Link
                href="/shop"
                className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Product Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-card overflow-hidden aspect-square relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/5 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-neon-violet/20 to-neon-purple/10 blur-3xl" />
                    <span className="absolute text-[10rem] font-display font-bold text-heading/5">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  {/* Tags */}
                  <div className="absolute top-6 left-6 flex gap-2">
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
                  {/* Wishlist */}
                  <button className="absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-body hover:text-heading">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {/* Right: Product Info */}
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

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-subtle-fg"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-fg">
                    {product.rating} ({product.reviews.toLocaleString()} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-heading">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-subtle-fg line-through">
                        ${product.originalPrice}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-body leading-relaxed mb-8">
                  {product.description}
                </p>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-8">
                    <p className="text-sm font-medium text-heading mb-3">Color</p>
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
                          aria-label={`Select color ${c.color}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <p className="text-sm font-medium text-heading mb-3">Quantity</p>
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
                      onClick={() => setQuantity(quantity + 1)}
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

                {/* Perks */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[var(--border)]">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Truck className="w-5 h-5 text-neon-violet" />
                    <span className="text-xs text-muted-fg">Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <Shield className="w-5 h-5 text-neon-violet" />
                    <span className="text-xs text-muted-fg">2 Year Warranty</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <RotateCcw className="w-5 h-5 text-neon-violet" />
                    <span className="text-xs text-muted-fg">30-Day Returns</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
