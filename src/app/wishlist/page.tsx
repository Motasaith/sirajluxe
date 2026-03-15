"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function WishlistPage() {
  const { items, loading, removeFromWishlist, itemCount } = useWishlist();
  const { addItem } = useCart();
  const { isSignedIn } = useUser();
  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (product: Record<string, any>) => {
    addItem({
      id: product.id || product._id?.toString(),
      name: product.name,
      price: product.price,
      image: product.image || "",
    });
    toast({ title: "Added to bag", description: product.name, variant: "success" });
  };

  return (
    <PageTransitionProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Page Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
              Your Collection
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-heading mb-4">
              My <span className="neon-text">Wishlist</span>
            </h1>
            <p className="text-lg text-muted-fg max-w-xl">
              {itemCount > 0
                ? `You have ${itemCount} item${itemCount !== 1 ? "s" : ""} saved for later.`
                : "Save your favourite products here for easy access."}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <motion.div
              className="glass-card p-12 text-center max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Heart className="w-16 h-16 text-subtle-fg mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-heading mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-muted-fg mb-8">
                {isSignedIn
                  ? "Browse our products and tap the heart icon to save items you love."
                  : "Sign in to sync your wishlist across devices, or browse as a guest."}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neon-violet text-white font-medium hover:shadow-neon transition-all"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {items.map((item: any, i: number) => {
                  // Support both populated product objects and bare IDs
                  const product = item.product || item;
                  const id =
                    product.id ||
                    product._id?.toString() ||
                    (typeof item === "string" ? item : "");
                  const name = product.name || "Saved Product";
                  const slug = product.slug || "";
                  const price = product.price;
                  const originalPrice = product.originalPrice;
                  const image = product.image;
                  const category = product.category || "";

                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="glass-card overflow-hidden group"
                    >
                      <Link href={slug ? `/shop/${slug}` : "/shop"}>
                        <div className="relative aspect-square bg-gradient-to-br from-surface to-background overflow-hidden cursor-pointer">
                          {image ? (
                            <Image
                              src={image}
                              alt={name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-violet/20 to-blue-500/10 blur-2xl" />
                              <span className="absolute text-6xl font-display font-bold text-heading/5">
                                {name.charAt(0)}
                              </span>
                            </div>
                          )}

                          {/* Remove from wishlist */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromWishlist(id);
                            }}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Link>

                      <div className="p-5">
                        {category && (
                          <p className="text-xs font-medium tracking-wider uppercase text-subtle-fg mb-2">
                            {category}
                          </p>
                        )}
                        <Link href={slug ? `/shop/${slug}` : "/shop"}>
                          <h3 className="text-lg font-semibold text-heading mb-2 line-clamp-1 hover:text-neon-glow transition-colors cursor-pointer">
                            {name}
                          </h3>
                        </Link>

                        {price !== undefined && (
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold text-heading">
                              £{price}
                            </span>
                            {originalPrice && (
                              <span className="text-sm text-subtle-fg line-through">
                                £{originalPrice}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium flex items-center justify-center gap-2 hover:shadow-neon transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(id)}
                            className="w-10 rounded-xl border border-[var(--border)] text-muted-fg hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
