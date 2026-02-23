"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { featuredCollections } from "@/lib/data";
import { ArrowRight, Clock, Sparkles } from "lucide-react";

export default function CollectionsPage() {
  return (
    <PageTransitionProvider>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Page Header */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-neon-violet" />
              <p className="text-sm font-medium tracking-widest uppercase text-neon-violet">
                Collections
              </p>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-heading mb-4">
              Curated <span className="neon-text">Worlds</span>
            </h1>
            <p className="text-lg text-muted-fg max-w-xl">
              Each collection tells a unique story. Explore our carefully
              curated worlds of premium products.
            </p>
          </motion.div>

          {/* Collections Grid */}
          <div className="grid gap-8">
            {featuredCollections.map((collection, i) => (
              <motion.div
                key={collection.id}
                className="group relative rounded-3xl overflow-hidden min-h-[400px] lg:min-h-[500px] cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ scale: 0.995 }}
              >
                {/* Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${collection.gradient}`}
                />
                <div className="absolute inset-0 glass !rounded-3xl" />

                {/* Neon border on hover */}
                <div className="absolute inset-0 rounded-3xl neon-border opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-10 lg:p-14">
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[var(--overlay-strong)] backdrop-blur-sm text-body">
                        <Clock className="w-3 h-3" />
                        {collection.subtitle}
                      </span>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-[var(--overlay)] text-muted-fg">
                        {collection.productCount} pieces
                      </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-heading mb-6">
                      {collection.title}
                    </h2>

                    <p className="text-lg text-body leading-relaxed max-w-2xl">
                      {collection.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-10">
                    <button className="magnetic-btn">
                      <span className="flex items-center gap-2">
                        Explore Collection
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-neon-violet/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
