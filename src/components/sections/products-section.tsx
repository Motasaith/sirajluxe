"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShoppingBag, Heart, Star, ArrowRight } from "lucide-react";
import { products } from "@/lib/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function ProductCard({
  product,
  index,
}: {
  product: (typeof products)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Magnetic effect on Add to Cart button
  const handleMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="product-card group relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
    >
      <div className="glass-card overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-surface to-background overflow-hidden">
          {/* Placeholder gradient since we don't have real images */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/5 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-violet/20 to-neon-purple/10 blur-2xl" />
            <span className="absolute text-6xl font-display font-bold text-heading/5">
              {product.name.charAt(0)}
            </span>
          </div>

          {/* Tags */}
          <div className="absolute top-4 left-4 flex gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                  tag === "Sale" || tag === "Hot"
                    ? "bg-red-500/20 text-red-300 border border-red-500/20"
                    : tag === "New" || tag === "Limited"
                    ? "bg-neon-violet/20 text-neon-glow border border-neon-violet/20"
                    : "bg-[var(--overlay-strong)] text-body border border-[var(--border-strong)]"
                }`}
              >
                {tag}
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

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <p className="text-xs font-medium tracking-wider uppercase text-subtle-fg mb-2">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="text-lg font-semibold text-heading group-hover:text-neon-glow transition-colors duration-300 mb-2 line-clamp-1">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-fg mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
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

          {/* Colors */}
          {product.colors && (
            <div className="flex items-center gap-2 mb-4">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded-full border-2 border-[var(--border-strong)] hover:border-[var(--accent)] transition-colors duration-200"
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-heading">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-subtle-fg line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <button
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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".products-title",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".products-title",
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative section-padding overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-1 opacity-5" />
      </div>

      <div className="relative ultra-wide-padding">
        {/* Section Header */}
        <div className="products-title flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
              Featured Products
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-heading">
              Trending <span className="neon-text">Now</span>
            </h2>
          </div>

          <motion.button
            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border-strong)] text-heading hover:bg-[var(--hover)] transition-all duration-300 self-start md:self-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm font-medium">View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
