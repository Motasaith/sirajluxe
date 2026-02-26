"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Star, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/ui/toast";

interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string;
  colors?: { color: string }[];
  sizes?: { size: string }[];
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    }, 1);
    toast({ title: "Added to bag", description: product.name, variant: "success" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[71] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-end p-4">
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--overlay)] transition-colors">
                  <X className="w-5 h-5 text-muted-fg" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
                {/* Image */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--overlay)]">
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Details */}
                <div className="flex flex-col">
                  <p className="text-xs font-medium tracking-widest uppercase text-neon-violet mb-2">{product.category}</p>
                  <h2 className="text-xl font-bold text-heading mb-2">{product.name}</h2>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-subtle-fg"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-fg">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl font-bold text-heading">£{product.price.toFixed(2)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-subtle-fg line-through">£{product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-fg mb-6 line-clamp-3">{product.description?.replace(/<[^>]*>/g, '')}</p>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-heading mb-2">Colour</p>
                      <div className="flex gap-2">
                        {product.colors.map((c) => (
                          <button
                            key={c.color}
                            onClick={() => setSelectedColor(c.color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.color ? "border-neon-violet scale-110" : "border-[var(--border)]"}`}
                            style={{ backgroundColor: c.color }}
                            title={c.color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-heading mb-2">Size</p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s) => (
                          <button
                            key={s.size}
                            onClick={() => setSelectedSize(s.size)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${selectedSize === s.size ? "border-neon-violet bg-neon-violet/10 text-neon-violet" : "border-[var(--border)] text-muted-fg hover:border-heading"}`}
                          >
                            {s.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex gap-3">
                    {product.inStock ? (
                      <button onClick={handleAdd} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-neon-violet text-white rounded-xl text-sm font-semibold hover:shadow-neon transition-all">
                        <ShoppingBag className="w-4 h-4" />
                        Add to Bag
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center px-6 py-3 bg-[var(--overlay)] text-subtle-fg rounded-xl text-sm font-medium">
                        Out of Stock
                      </div>
                    )}
                    <Link href={`/shop/${product.slug}`} onClick={onClose} className="flex items-center justify-center gap-2 px-4 py-3 border border-[var(--border)] rounded-xl text-sm font-medium text-muted-fg hover:text-heading hover:border-heading transition-all">
                      <Eye className="w-4 h-4" />
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
