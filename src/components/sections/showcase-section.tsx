"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";
import Link from "next/link";

export function ShowcaseSection() {
  const { data: cms, enabled } = useSiteContent("homepage.showcase");
  const textRef = useRef<HTMLDivElement>(null);

  if (!enabled) return null;

  const features = Array.isArray(cms?.features) && cms.features.length > 0
    ? cms.features
    : [
        {
          number: "01",
          title: "3D Product Exploration",
          description: "Rotate, zoom, and interact with products in full 3D before you buy. No more guessing.",
        },
        {
          number: "02",
          title: "AI-Powered Curation",
          description: "Our algorithms learn your style and surface products that match your unique aesthetic.",
        },
        {
          number: "03",
          title: "Instant AR Try-On",
          description: "See how products look on you or in your space using cutting-edge augmented reality.",
        },
        {
          number: "04",
          title: "Global Express Delivery",
          description: "From checkout to doorstep in 24-48 hours. Premium packaging, carbon-neutral shipping.",
        },
      ];

  return (
    <section className="relative section-padding overflow-hidden">
      {/* Massive scrolling background text */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 pointer-events-none opacity-[0.03]">
        <motion.div
          className="whitespace-nowrap text-[12vw] font-display font-black text-heading select-none"
          animate={{ x: ["10%", "-10%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          FUTURE OF COMMERCE • IMMERSIVE SHOPPING • NEXT LEVEL •
        </motion.div>
        <motion.div
          className="whitespace-nowrap text-[12vw] font-display font-black text-heading select-none"
          animate={{ x: ["-10%", "10%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          OBSIDIAN STORE • PREMIUM DESIGN • INNOVATION •
        </motion.div>
      </div>

      <div className="relative ultra-wide-padding">
        {/* Content Split */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-32">
          {/* Left: Big Statement */}
          <div ref={textRef}>
            <motion.p
              className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {cms?.label || "Why Siraj Luxe"}
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-heading leading-[1.1] mb-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {cms?.heading || "Shopping should feel like an"}{" "}
              <span className="neon-text">experience</span>, not a transaction.
            </motion.h2>
            <motion.p
              className="text-lg text-body leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {cms?.body || "We bridge the gap between digital and physical shopping by creating immersive product stories. Every scroll, every click, every interaction is designed to delight."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/about" className="magnetic-btn inline-flex">
                <span className="flex items-center gap-2">
                  {cms?.ctaText || "Our Story"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Right: Abstract Morph Shape */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className="w-80 h-80 md:w-96 md:h-96 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Morphing blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-violet via-neon-purple to-neon-blue animate-morph opacity-30 blur-xl" />
              <div className="absolute inset-4 bg-gradient-to-br from-neon-violet via-neon-purple to-neon-blue animate-morph opacity-50 blur-md" />
              <div className="absolute inset-8 glass-heavy rounded-[inherit] animate-morph flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-display font-black neon-text">∞</p>
                  <p className="text-xs text-body tracking-widest uppercase mt-2">
                    Immersive
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="showcase-features grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              className="group glass-card p-8 hover:border-neon-violet/30"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-5xl font-display font-black text-heading/5 group-hover:text-neon-violet/20 transition-colors duration-500">
                {feature.number}
              </span>
              <h3 className="text-lg font-semibold text-heading mt-4 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-fg leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
