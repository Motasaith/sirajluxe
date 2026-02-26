"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";
import { categories } from "@/lib/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CategoriesSection() {
  const { data: cms, enabled } = useSiteContent("homepage.categories");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section title reveal
      gsap.fromTo(
        ".categories-title",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".categories-title",
            start: "top 85%",
            end: "top 30%",
          },
        }
      );

      // Bento grid items stagger
      gsap.fromTo(
        ".bento-item",
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 80%",
            end: "top 20%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!enabled) return null;

  return (
    <section ref={sectionRef} className="relative section-padding overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-2 opacity-10" />
      </div>

      <div className="relative ultra-wide-padding">
        {/* Section Header */}
        <div className="categories-title mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
            {cms?.label || "Browse Categories"}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-heading max-w-3xl">
            {cms?.heading || "Curated collections for the"}{" "}
            <span className="neon-text">discerning</span> eye.
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((category, i) => {
            // First 2 items are large (span 2 on lg), rest are normal
            const isLarge = i < 2;

            return (
              <motion.div
                key={category.id}
                className={`bento-item group relative rounded-3xl overflow-hidden cursor-pointer ${
                  isLarge && i === 0
                    ? "lg:col-span-2 lg:row-span-2 min-h-[300px] lg:min-h-[500px]"
                    : isLarge
                    ? "min-h-[300px] lg:min-h-[500px]"
                    : "min-h-[250px] lg:min-h-[300px]"
                }`}
                whileHover={{ scale: 0.99 }}
                transition={{ duration: 0.4 }}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`}
                />

                {/* Glass overlay */}
                <div className="absolute inset-0 glass-card !rounded-3xl !border-[var(--border)]">
                  {/* Noise texture */}
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg+viewBox=%220+0+256+256%22+xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter+id=%22noise%22%3E%3CfeTurbulence+type=%22fractalNoise%22+baseFrequency=%220.9%22+numOctaves=%224%22+stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect+width=%22100%25%22+height=%22100%25%22+filter=%22url(%23noise)%22+opacity=%220.5%22/%3E%3C/svg%3E')]" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6 lg:p-8">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--overlay-strong)] text-body backdrop-blur-sm mb-4">
                      {category.productCount} Products
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`font-display font-bold text-white mb-2 ${
                        isLarge ? "text-3xl lg:text-4xl" : "text-2xl lg:text-3xl"
                      }`}
                    >
                      {category.name}
                    </h3>
                    <p className="text-sm text-body mb-4">
                      {category.description}
                    </p>

                    {/* Explore link */}
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-sm font-medium group-hover:text-neon-glow transition-colors duration-300">
                        Explore
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[var(--overlay-strong)] flex items-center justify-center group-hover:bg-neon-violet group-hover:scale-110 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-neon-violet/10 to-transparent" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
