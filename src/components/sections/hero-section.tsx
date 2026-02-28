"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";
import Link from "next/link";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
});

const fadeRight = (delay: number) => ({
  initial: { opacity: 0, x: 60, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export function HeroSection() {
  const { data: cms, enabled } = useSiteContent("homepage.hero");

  if (!enabled) return null;

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-background">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-3" />
      </div>

      {/* Main content — two-column layout */}
      <div className="relative z-10 ultra-wide-padding w-full pt-36 pb-16 md:pt-40 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* ── Left: Text content ── */}
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div {...fadeUp(0.2)}>
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium tracking-widest uppercase text-body mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <span className="w-2 h-2 rounded-full bg-neon-violet animate-glow-pulse" />
                {cms?.badge || "Spring 2026 Collection"}
              </motion.span>
            </motion.div>

            {/* Title */}
            <h1>
              <motion.div {...fadeUp(0.3)}>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-heading leading-[1.05] tracking-tight">
                  {cms?.headline1 || "Discover Premium"}
                </span>
              </motion.div>
              <motion.div {...fadeUp(0.42)}>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight neon-text">
                  {cms?.headline2 || "Products You'll"}
                </span>
              </motion.div>
              <motion.div {...fadeUp(0.54)}>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-heading leading-[1.05] tracking-tight">
                  {cms?.headline3 || "Love."}
                </span>
              </motion.div>
            </h1>

            {/* Subtitle */}
            <motion.p {...fadeUp(0.7)} className="mt-6 text-base md:text-lg text-body max-w-lg leading-relaxed">
              {cms?.subtitle || "Shop curated collections from top brands. Premium quality, fast delivery, and an experience designed to delight — every time you shop."}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div {...fadeUp(0.9)} className="flex flex-wrap items-center gap-4 mt-8">
              <Link href="/shop" className="magnetic-btn">
                <span className="flex items-center gap-2">
                  {cms?.ctaPrimaryText || "Shop Now"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <Link href="/collections" className="group flex items-center gap-2 px-6 py-3.5 rounded-full border border-[var(--border-strong)] text-heading hover:bg-[var(--hover)] transition-all duration-300">
                <span className="text-sm font-medium tracking-wide">
                  {cms?.ctaSecondaryText || "Browse Collections"}
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div {...fadeUp(0.9)} className="flex items-center gap-6 mt-8">
              {/* Avatars */}
              <div className="flex -space-x-2">
                {["#8b5cf6", "#ec4899", "#f59e0b", "#10b981"].map(
                  (bg, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: bg, zIndex: 4 - i }}
                    >
                      {["JD", "SK", "AL", "MR"][i]}
                    </div>
                  )
                )}
              </div>
              <div className="border-l border-[var(--border)] pl-6">
                <p className="text-sm font-semibold text-heading">{cms?.socialProofCount || "50K+"}</p>
                <p className="text-xs text-muted-fg">
                  {cms?.socialProofText || "5 Star Rating Customers"}
                </p>
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div {...fadeUp(1.1)} className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6">
              {[
                { icon: CheckCircle2, text: "Premium Quality" },
                { icon: Shield, text: "Secure Checkout" },
                { icon: Truck, text: "Free Shipping" },
              ].map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-2 text-muted-fg"
                >
                  <badge.icon className="w-4 h-4 text-neon-violet" />
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Product showcase ── */}
          <motion.div {...fadeRight(0.5)} className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Decorative glow behind product */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/20 via-neon-purple/10 to-transparent rounded-[2rem] blur-3xl scale-110" />

              {/* Main product card */}
              <motion.div
                className="relative glass-card overflow-hidden !rounded-[2rem] p-1"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4 }}
              >
                {/* Product image area */}
                <div className="relative aspect-[4/5] rounded-[1.75rem] bg-gradient-to-br from-neon-violet/10 via-[var(--overlay)] to-neon-purple/5 overflow-hidden flex items-center justify-center">
                  {/* Abstract product visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <motion.div
                        animate={{ y: [-8, 8, -8] }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <ShoppingBag className="w-32 h-32 md:w-40 md:h-40 text-neon-violet/20" strokeWidth={0.8} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Floating mini badges on image */}
                  <motion.div
                    className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="text-[10px] font-semibold text-neon-violet uppercase tracking-wider">
                      New Arrival
                    </span>
                  </motion.div>

                  <motion.div
                    className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full"
                    animate={{ y: [3, -3, 3] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="text-[10px] font-semibold text-heading flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      4.9
                    </span>
                  </motion.div>

                  {/* Discount tag */}
                  <motion.div
                    className="absolute bottom-4 left-4 bg-neon-violet text-white px-3 py-1.5 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="text-[11px] font-bold tracking-wide">
                      30% OFF
                    </span>
                  </motion.div>

                  {/* Price on image */}
                  <div className="absolute bottom-4 right-4 glass px-4 py-2 rounded-2xl">
                    <span className="text-lg font-bold text-heading">£249</span>
                    <span className="text-xs text-muted-fg line-through ml-2">
                      £349
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Floating stat cards around the product */}
              <motion.div
                className="hidden sm:flex absolute -left-8 top-1/4 glass-card !rounded-2xl p-4 items-center gap-3"
                animate={{ y: [-5, 5, -5] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-neon-violet" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-heading">
                    Free Delivery
                  </p>
                  <p className="text-[10px] text-muted-fg">On orders £50+</p>
                </div>
              </motion.div>

              <motion.div
                className="hidden sm:flex absolute -right-4 bottom-1/4 glass-card !rounded-2xl p-4 items-center gap-3"
                animate={{ y: [5, -5, 5] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-heading">
                    100% Authentic
                  </p>
                  <p className="text-[10px] text-muted-fg">
                    Verified brands
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-subtle-fg"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
