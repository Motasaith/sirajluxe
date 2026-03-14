"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";
import Link from "next/link";
import { useState, useEffect } from "react";

function CategoryCardImage({ categoryName }: { categoryName: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      try {
        const url = `/api/products?category=${encodeURIComponent(categoryName)}&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        if (!mounted) return;
        if (data.docs && data.docs.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productImages = data.docs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => p.image || (p.images && p.images[0]))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((img: any) => typeof img === "string" && img.length > 0);
          if (productImages.length > 0) {
            setImages(productImages);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products for category", categoryName, error);
      }
    }
    fetchProducts();
    return () => { mounted = false; };
  }, [categoryName]);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [images]);

  if (images.length === 0) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.img
        key={currentIndex}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 0.5, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        src={images[currentIndex]}
        alt={`${categoryName} product`}
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
      />
    </AnimatePresence>
  );
}

const GRADIENTS = [
  "from-violet-600/20 to-purple-900/20",
  "from-blue-600/20 to-indigo-900/20",
  "from-pink-600/20 to-rose-900/20",
  "from-emerald-600/20 to-teal-900/20",
  "from-amber-600/20 to-orange-900/20",
  "from-cyan-600/20 to-sky-900/20",
];

export function CategoriesSection() {
  const { data: cms, enabled } = useSiteContent("homepage.categories");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeCategories, setActiveCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.docs && data.docs.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setActiveCategories(data.docs.map((doc: any, i: number) => ({
            id: doc.id,
            name: doc.name,
            description: doc.description || "Explore collection",
            productCount: doc.productCount || 0,
            gradient: GRADIENTS[i % GRADIENTS.length],
          })));
        }
      })
      .catch(console.error);
  }, []);

  if (!enabled) return null;

  return (
    <section className="relative section-padding overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="gradient-orb gradient-orb-2 opacity-10" />
      </div>

      <div className="relative ultra-wide-padding">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
            {cms?.label || "Browse Categories"}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-heading max-w-3xl">
            {cms?.heading || "Curated collections for the"}{" "}
            <span className="neon-text">discerning</span> eye.
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {activeCategories.map((category, i) => {
            // First 2 items are large (span 2 on lg), rest are normal
            const isLarge = i < 2;

            return (
              <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-black ${
                  isLarge && i === 0
                    ? "lg:col-span-2 lg:row-span-2 min-h-[300px] lg:min-h-[500px]"
                    : isLarge
                    ? "min-h-[300px] lg:min-h-[500px]"
                    : "min-h-[250px] lg:min-h-[300px]"
                }`}
                whileHover={{ scale: 0.99 }}
              >
                <CategoryCardImage categoryName={category.name} />

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
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
