"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useSiteContent } from "@/components/providers/site-content-provider";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import Image from "next/image";

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
  colors?: { color: string }[];
}

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
    });
    toast({ title: "Added to bag", description: product.name, variant: "success" });
  };

  // Magnetic effect on Add to Cart button
  const handleMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    btn.style.transition = "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)";
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translate(0, 0)";
    e.currentTarget.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
  };

  return (
    <motion.div
      className="product-card group relative h-full flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
    >
      <div className="glass-card overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <Link href={`/shop/${product.slug}`}>
          <div className="relative aspect-square bg-gradient-to-br from-surface to-background overflow-hidden cursor-pointer">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/5 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-violet/20 to-blue-500/10 blur-2xl" />
                  <span className="absolute text-6xl font-display font-bold text-heading/5">
                    {product.name.charAt(0)}
                  </span>
                </div>
              </>
            )}

            {/* Tags */}
            <div className="absolute top-4 left-4 flex gap-2">
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

            {/* Quick Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-body hover:text-heading hover:bg-neon-violet/20 transition-all duration-300">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </Link>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Category */}
          <p className="text-xs font-medium tracking-wider uppercase text-subtle-fg mb-2">
            {product.category}
          </p>

          {/* Name */}
          <Link href={`/shop/${product.slug}`}>
            <h3 className="text-lg font-semibold text-heading group-hover:text-neon-glow transition-colors duration-300 mb-2 line-clamp-1 cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-sm text-muted-fg mb-4 line-clamp-2 leading-relaxed">
            {product.description?.replace(/<[^>]*>/g, '')}
          </p>

          {/* Rating - only show if product has ratings */}
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

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {product.colors.map((c) => (
                <button
                  key={c.color}
                  className="w-5 h-5 rounded-full border-2 border-[var(--border-strong)] hover:border-[var(--accent)] transition-colors duration-200"
                  style={{ backgroundColor: c.color }}
                  aria-label={`Select color ${c.color}`}
                />
              ))}
            </div>
          )}

          {/* Price & CTA */}
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

            <button
              onClick={handleAddToCart}
              onMouseMove={handleMagnetic}
              onMouseLeave={handleMagneticLeave}
              className="w-10 h-10 rounded-full bg-neon-violet flex items-center justify-center text-white hover:shadow-neon transition-all duration-300 hover:scale-110"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductsSection() {
  const { data: cms, enabled } = useSiteContent("homepage.products");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products?featured=true&limit=8");
        const data = await res.json();
        setProducts(data.docs || []);
      } catch (e) {
        console.error("Failed to fetch featured products:", e);
      }
    }
    fetchFeatured();
  }, []);

  if (!enabled) return null;

  return (
    <section className="relative section-padding overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-1 opacity-5" />
      </div>

      <div className="relative ultra-wide-padding">
        {/* Section Header */}
        <motion.div
          className="products-title flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
              {cms?.label || "Featured Products"}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-heading">
              {cms?.heading || "Trending"} <span className="neon-text">Now</span>
            </h2>
          </div>

          <Link href="/shop">
            <motion.button
              className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border-strong)] text-heading hover:bg-[var(--hover)] transition-all duration-300 self-start md:self-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm font-medium">{cms?.buttonText || "View All Products"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0
            ? products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            : /* Skeleton placeholders while loading */
              [...Array(4)].map((_, i) => (
                <div key={i} className="glass-card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-surface" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-16 bg-surface rounded" />
                    <div className="h-5 w-full bg-surface rounded" />
                    <div className="h-3 w-3/4 bg-surface rounded" />
                    <div className="h-8 w-20 bg-surface rounded" />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
