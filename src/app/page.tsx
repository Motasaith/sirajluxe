"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { CategoriesSection } from "@/components/sections/categories-section";
import { ProductsSection } from "@/components/sections/products-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";
import { CollectionsSection } from "@/components/sections/collections-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CTASection } from "@/components/sections/cta-section";
import { Preloader } from "@/components/ui/preloader";
import { CartDrawer } from "@/components/ui/cart-drawer";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader
            key="preloader"
            onComplete={() => setIsLoading(false)}
          />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
      )}
    </>
  );
}
