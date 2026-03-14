"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Star,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  Loader2,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { QuickViewModal } from "@/components/ui/quick-view-modal";
import { blurDataURL } from "@/lib/blur-placeholder";
import { Eye } from "lucide-react";

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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const PER_PAGE = 12;

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-neon-violet" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mountedRef = useRef(false);

  const [activeFilter, setActiveFilter] = useState(() => searchParams.get("category") || "All");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  // Search, sort, filter, pagination — initialized from URL
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(() => searchParams.get("sort") || "newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) || 1 : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const sortRef = useRef<HTMLDivElement>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Advanced filter state
  const [selectedColor, setSelectedColor] = useState(() => searchParams.get("color") || "");
  const [selectedSize, setSelectedSize] = useState(() => searchParams.get("size") || "");
  const [minRating, setMinRating] = useState(() => searchParams.get("minRating") || "");
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change (skip initial mount)
  useEffect(() => {
    if (!mountedRef.current) return;
    setCurrentPage(1);
  }, [activeFilter, debouncedSearch, sortBy, minPrice, maxPrice, selectedColor, selectedSize, minRating]);

  // Sync filters to URL (skip initial mount)
  useEffect(() => {
    if (!mountedRef.current) return;
    const params = new URLSearchParams();
    if (activeFilter !== "All") params.set("category", activeFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (selectedColor) params.set("color", selectedColor);
    if (selectedSize) params.set("size", selectedSize);
    if (minRating) params.set("minRating", minRating);
    const newUrl = params.toString() ? `/shop?${params}` : "/shop";
    router.replace(newUrl, { scroll: false });
  }, [activeFilter, debouncedSearch, sortBy, currentPage, minPrice, maxPrice, selectedColor, selectedSize, minRating, router]);

  // Mark component as mounted (must be AFTER the guard effects above)
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const names = (data.categories || data.docs || []).map(
          (c: { name: string }) => c.name
        );
        setCategories(names);
      } catch {
        /* fallback to empty */
      }
    }
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PER_PAGE));
      params.set("page", String(currentPage));
      params.set("sort", sortBy);
      if (activeFilter !== "All")
        params.set("category", activeFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (selectedColor) params.set("color", selectedColor);
      if (selectedSize) params.set("size", selectedSize);
      if (minRating) params.set("minRating", minRating);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.docs || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);
      if (data.availableColors) setAvailableColors(data.availableColors);
      if (data.availableSizes) setAvailableSizes(data.availableSizes);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch, sortBy, minPrice, maxPrice, selectedColor, selectedSize, minRating, currentPage]);

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
    toast({ title: "Added to bag", description: product.name, variant: "success" });
  };

  const handleMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${relX * 0.3}px, ${relY * 0.3}px)`;
    btn.style.transition = "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)";
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.transform = "translate(0, 0)";
    target.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
  };

  const allCategories = ["All", ...categories];

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveFilter("All");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setSelectedColor("");
    setSelectedSize("");
    setMinRating("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    activeFilter !== "All" ||
    debouncedSearch ||
    minPrice ||
    maxPrice ||
    selectedColor ||
    selectedSize ||
    minRating ||
    sortBy !== "newest";

  return (
    <PageTransitionProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          <Breadcrumbs items={[{ label: "Shop" }]} />

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

          {/* Search Bar */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-10 py-3 rounded-2xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg text-sm focus:outline-none focus:border-neon-violet transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-fg hover:text-heading"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
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

            {/* Sort + View Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass text-body hover:text-heading text-sm transition-all duration-300"
                >
                  {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute right-0 top-12 glass-card p-2 rounded-xl z-50 min-w-[200px]"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            sortBy === opt.value
                              ? "text-neon-violet bg-neon-violet/10"
                              : "text-body hover:text-heading hover:bg-[var(--overlay)]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  showFilters
                    ? "bg-neon-violet text-white"
                    : "glass text-body hover:text-heading"
                }`}
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
                {totalProducts} product{totalProducts !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>

          {/* Price Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="glass-card p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Price Range */}
                    <div>
                      <h3 className="text-sm font-semibold text-heading mb-3">
                        Price Range
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-muted-fg mb-1 block">
                            Min (£)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading text-sm focus:outline-none focus:border-neon-violet"
                          />
                        </div>
                        <span className="text-muted-fg mt-5">—</span>
                        <div className="flex-1">
                          <label className="text-xs text-muted-fg mb-1 block">
                            Max (£)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Any"
                            className="w-full px-3 py-2 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading text-sm focus:outline-none focus:border-neon-violet"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Color Filter */}
                    {availableColors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-heading mb-3">
                          Color
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                selectedColor === color
                                  ? "bg-neon-violet text-white"
                                  : "bg-[var(--overlay)] border border-[var(--border)] text-body hover:text-heading hover:border-neon-violet/30"
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Filter */}
                    {availableSizes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-heading mb-3">
                          Size
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                selectedSize === size
                                  ? "bg-neon-violet text-white"
                                  : "bg-[var(--overlay)] border border-[var(--border)] text-body hover:text-heading hover:border-neon-violet/30"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating Filter */}
                    <div>
                      <h3 className="text-sm font-semibold text-heading mb-3">
                        Minimum Rating
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        {[4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setMinRating(minRating === String(rating) ? "" : String(rating))}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                              minRating === String(rating)
                                ? "bg-neon-violet/10 text-neon-violet border border-neon-violet/20"
                                : "text-body hover:text-heading hover:bg-[var(--overlay)]"
                            }`}
                          >
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rating ? "fill-amber-400 text-amber-400" : "text-subtle-fg"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs">& up</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-xs text-neon-violet hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-heading font-semibold mb-2">
                No products found
              </p>
              <p className="text-sm text-muted-fg mb-6">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}". Try different keywords.`
                  : "Try adjusting your filters."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter + viewMode + sortBy + currentPage}
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
                  className={`group h-full flex flex-col ${viewMode === "list" ? "glass-card overflow-hidden flex-row border" : ""}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  {viewMode === "grid" ? (
                    <div className="glass-card overflow-hidden h-full flex flex-col">
                      <Link href={`/shop/${product.slug}`}>
                        <div className="relative aspect-square bg-gradient-to-br from-surface to-background overflow-hidden cursor-pointer">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 50vw, 33vw"
                              placeholder="blur"
                              blurDataURL={blurDataURL}
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
                          {/* Quick View Overlay */}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <span className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-white border border-white/20">
                              <Eye className="w-4 h-4" />
                              Quick View
                            </span>
                          </button>
                          <div className="absolute top-4 left-4 flex gap-2 z-20">
                            {product.tags?.map((t) => (
                              <span
                                key={t.tag}
                                className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md bg-[var(--overlay-strong)] text-body border border-[var(--border-strong)]"
                              >
                                {t.tag}
                              </span>
                            ))}
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product.id);
                              }}
                              className="w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:scale-110"
                            >
                              <Heart
                                className={`w-4 h-4 transition-colors ${
                                  isInWishlist(product.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-body hover:text-heading"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </Link>
                      <div className="p-5 flex flex-col flex-grow">
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
                        <div className="flex items-center justify-between mt-auto pt-4">
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
                          {product.inStock ? (
                            <button
                              onClick={() => handleAddToCart(product)}
                              onMouseMove={handleMagnetic}
                              onMouseLeave={handleMagneticLeave}
                              className="w-10 h-10 rounded-full bg-neon-violet flex items-center justify-center text-white hover:shadow-neon transition-all duration-300 hover:scale-110"
                            >
                              <ShoppingBag className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                              Out of Stock
                            </span>
                          )}
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
                              placeholder="blur"
                              blurDataURL={blurDataURL}
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
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="p-2 rounded-full hover:bg-[var(--overlay)] transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isInWishlist(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-muted-fg hover:text-heading"
                            }`}
                          />
                        </button>
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
                        {product.inStock ? (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-10 h-10 rounded-full bg-neon-violet flex items-center justify-center text-white hover:shadow-neon transition-all duration-300"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-body hover:text-heading disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-muted-fg">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        currentPage === p
                          ? "bg-neon-violet text-white shadow-neon"
                          : "glass text-body hover:text-heading"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-body hover:text-heading disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </PageTransitionProvider>
  );
}
