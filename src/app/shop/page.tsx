"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Heart,
  Star,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  Loader2,
} from "lucide-react";
import gsap from "gsap";

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
  image: string;
  colors?: { color: string }[];
}

const filterCategories = ["All", "Footwear", "Watches", "Audio", "Apparel", "Tech", "Accessories", "Bags"];

export default function ShopPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/products?limit=50`;
      if (activeFilter !== "All") url += `&category=${encodeURIComponent(activeFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.docs || []);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
    });
  };

  const handleMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <PageTransitionProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Page Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
              The Store
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-heading mb-4">
              All <span className="neon-text">Products</span>
            </h1>
            <p className="text-lg text-muted-fg max-w-xl">
              Discover our full catalog of premium products, curated for the
              discerning customer.
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === category
                      ? "bg-neon-violet text-white shadow-neon"
                      : "glass text-body hover:text-heading"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass text-body hover:text-heading text-sm transition-all duration-300"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              <div className="flex items-center glass rounded-full p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-neon-violet text-white"
                      : "text-muted-fg hover:text-heading"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-neon-violet text-white"
                      : "text-muted-fg hover:text-heading"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-subtle-fg">
                {products.length} products
              </span>
            </div>
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-muted-fg">No products found. Try a different category or seed the database.</p>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter + viewMode}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4"
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  className={`group ${viewMode === "list" ? "glass-card overflow-hidden flex" : ""}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  {viewMode === "grid" ? (
                    <div className="glass-card overflow-hidden">
                      <Link href={`/shop/${product.slug}`}>
                        <div className="relative aspect-square bg-gradient-to-br from-surface to-background overflow-hidden cursor-pointer">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/5 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-violet/20 to-neon-purple/10 blur-2xl" />
                                <span className="absolute text-6xl font-display font-bold text-heading/5">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="absolute top-4 left-4 flex gap-2">
                            {product.tags?.map((t) => (
                              <span
                                key={t.tag}
                                className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md bg-[var(--overlay-strong)] text-body border border-[var(--border-strong)]"
                              >
                                {t.tag}
                              </span>
                            ))}
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-body hover:text-heading">
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Link>
                      <div className="p-5">
                        <p className="text-xs font-medium tracking-wider uppercase text-subtle-fg mb-2">
                          {product.category}
                        </p>
                        <Link href={`/shop/${product.slug}`}>
                          <h3 className="text-lg font-semibold text-heading mb-2 line-clamp-1 hover:text-neon-glow transition-colors cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-fg mb-4 line-clamp-2">
                          {product.description?.replace(/<[^>]*>/g, '')}
                        </p>
                        {product.rating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(product.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-subtle-fg"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-fg">
                            ({product.reviews.toLocaleString()})
                          </span>
                        </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-heading">
                              £{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-subtle-fg line-through">
                                £{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            onMouseMove={handleMagnetic}
                            onMouseLeave={handleMagneticLeave}
                            className="w-10 h-10 rounded-full bg-neon-violet flex items-center justify-center text-white hover:shadow-neon transition-all duration-300 hover:scale-110"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* List View */
                    <div className="flex items-center gap-6 p-4">
                      <Link href={`/shop/${product.slug}`}>
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-surface to-background flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden relative">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <span className="text-3xl font-display font-bold text-heading/5">
                              {product.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-subtle-fg uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <Link href={`/shop/${product.slug}`}>
                          <h3 className="text-lg font-semibold text-heading mb-1 truncate hover:text-neon-glow transition-colors cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-fg line-clamp-1">
                          {product.description?.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xl font-bold text-heading">
                            £{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="block text-sm text-subtle-fg line-through">
                              £{product.originalPrice}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-10 h-10 rounded-full bg-neon-violet flex items-center justify-center text-white hover:shadow-neon transition-all duration-300"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
