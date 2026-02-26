"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";
import { featuredCollections } from "@/lib/data";

export function CollectionsSection() {
  const { data: cms, enabled } = useSiteContent("homepage.collections");

  if (!enabled) return null;

  return (
    <section className="relative section-padding overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-3 opacity-10" />
      </div>

      <div className="relative ultra-wide-padding">
        {/* Section Header */}
        <motion.div
          className="collections-title flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-neon-violet" />
              <p className="text-sm font-medium tracking-widest uppercase text-neon-violet">
                {cms?.label || "Featured Collections"}
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-heading">
              {cms?.heading || "Explore our"} <span className="neon-text">curated</span> worlds.
            </h2>
          </div>

          <motion.button
            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border-strong)] text-heading hover:bg-[var(--hover)] transition-all duration-300 self-start md:self-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-sm font-medium">{cms?.buttonText || "All Collections"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </motion.div>

        {/* Collections Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCollections.map((collection, i) => (
            <motion.div
              key={collection.id}
              className="collection-card group relative rounded-3xl overflow-hidden min-h-[400px] lg:min-h-[500px] cursor-pointer"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 0.98 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${collection.gradient}`}
              />

              {/* Glass overlay */}
              <div className="absolute inset-0 glass !rounded-3xl" />

              {/* Animated border glow on hover */}
              <div className="absolute inset-0 rounded-3xl neon-border opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-10">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--overlay-strong)] backdrop-blur-sm text-body">
                      <Clock className="w-3 h-3" />
                      {collection.subtitle}
                    </span>
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                    {collection.title}
                  </h3>

                  <p className="text-sm text-body leading-relaxed max-w-sm">
                    {collection.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-8">
                  <span className="text-sm text-muted-fg">
                    {collection.productCount} pieces
                  </span>

                  <div className="flex items-center gap-2 text-white">
                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      Explore
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[var(--overlay-strong)] flex items-center justify-center group-hover:bg-neon-violet group-hover:scale-110 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neon-violet/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
