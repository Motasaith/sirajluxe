"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

export function SearchDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Autofocus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`)
        .then((r) => r.json())
        .then((data) => setResults(data.docs || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Search Panel */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[61] bg-[var(--bg-primary)] border-b border-[var(--border)]"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ultra-wide-padding py-8">
              <form onSubmit={handleSubmit} className="relative mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-fg" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-14 pr-14 py-5 text-xl bg-[var(--overlay)] border border-[var(--border)] rounded-2xl text-heading placeholder:text-subtle-fg focus:outline-none focus:border-neon-violet/50 focus:ring-2 focus:ring-neon-violet/20"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-[var(--hover)] transition-colors"
                >
                  <X className="w-5 h-5 text-muted-fg" />
                </button>
              </form>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-neon-violet" />
                  </div>
                )}

                {!loading && query && results.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-fg">
                      No products found for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="space-y-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--overlay)] transition-colors group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--overlay)] shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-fg text-xs">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-heading truncate group-hover:text-neon-violet transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-subtle-fg">
                            {product.category}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-heading">
                          £{product.price.toFixed(2)}
                        </p>
                      </Link>
                    ))}
                    <div className="pt-3 border-t border-[var(--border)]">
                      <button
                        onClick={() => {
                          router.push(
                            `/shop?search=${encodeURIComponent(query)}`
                          );
                          onClose();
                        }}
                        className="w-full text-center py-3 text-sm text-neon-violet hover:underline"
                      >
                        View all results for &ldquo;{query}&rdquo; →
                      </button>
                    </div>
                  </div>
                )}

                {!loading && !query && (
                  <div className="text-center py-6">
                    <p className="text-subtle-fg text-sm">
                      Start typing to search products...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
