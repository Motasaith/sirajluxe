"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { Preloader } from "@/components/ui/preloader";
import { CartDrawer } from "@/components/ui/cart-drawer";

// Below-fold sections lazy loaded
const CategoriesSection = dynamic(() => import("@/components/sections/categories-section").then((mod) => mod.CategoriesSection), { ssr: false });
const ProductsSection = dynamic(() => import("@/components/sections/products-section").then((mod) => mod.ProductsSection), { ssr: false });
const ShowcaseSection = dynamic(() => import("@/components/sections/showcase-section").then((mod) => mod.ShowcaseSection), { ssr: false });
const CollectionsSection = dynamic(() => import("@/components/sections/collections-section").then((mod) => mod.CollectionsSection), { ssr: false });
const TestimonialsSection = dynamic(() => import("@/components/sections/testimonials-section").then((mod) => mod.TestimonialsSection), { ssr: false });
const CTASection = dynamic(() => import("@/components/sections/cta-section").then((mod) => mod.CTASection), { ssr: false });

const PRELOADER_KEY = "sirajluxe-preloader-shown";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Only show preloader once per session
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(PRELOADER_KEY)) {
      setIsLoading(false);
    }
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    try { sessionStorage.setItem(PRELOADER_KEY, "1"); } catch {}
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://sirajluxe.com/#org",
                name: "Siraj Luxe",
                url: "https://sirajluxe.com",
                logo: "https://sirajluxe.com/icon",
                description: "UK-based premium goods store with curated products, fast delivery, and hassle-free returns.",
                sameAs: [
                  "https://x.com/sirajluxe",
                  "https://instagram.com/sirajluxe",
                  "https://linkedin.com/company/sirajluxe",
                ],
              },
              {
                "@type": "WebSite",
                "@id": "https://sirajluxe.com/#website",
                url: "https://sirajluxe.com",
                name: "Siraj Luxe",
                publisher: { "@id": "https://sirajluxe.com/#org" },
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://sirajluxe.com/shop?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }),
        }}
      />

      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader
            key="preloader"
            onComplete={handlePreloaderComplete}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        aria-hidden={isLoading}
      >
        <Header />
        <main className="relative">
          <HeroSection />
          <div className="section-divider" />
          <CategoriesSection />
          <div className="section-divider" />
          <ProductsSection />
          <div className="section-divider" />
          <ShowcaseSection />
          <div className="section-divider" />
          <CollectionsSection />
          <div className="section-divider" />
          <TestimonialsSection />
          <div className="section-divider" />
          <CTASection />
        </main>
        <Footer />
        <CartDrawer />
      </motion.div>
    </>
  );
}
