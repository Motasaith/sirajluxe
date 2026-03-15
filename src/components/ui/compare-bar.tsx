"use client";

import { useCompare } from "@/components/providers/compare-provider";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight, GitCompareArrows } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CompareBar() {
  const { items, removeItem, count } = useCompare();

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[90] bg-[var(--glass-bg)] backdrop-blur-2xl border-t border-[var(--glass-border)] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)] flex-shrink-0">
            <GitCompareArrows className="w-4 h-4 text-neon-violet" />
            <span className="font-medium text-heading">{count}</span> / 4
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {items.map((item) => (
              <div key={item.id} className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] bg-white/[0.02]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--overlay)]" />
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <Link
            href="/compare"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-violet text-white font-medium text-sm hover:bg-blue-500 transition-colors flex-shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            Compare <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
