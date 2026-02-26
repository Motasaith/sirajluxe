"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";

export function CartDrawer() {
  const {
    items,
    itemCount,
    total,
    removeItem,
    updateQuantity,
    clearCart,
    isOpen,
    closeCart,
  } = useCart();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          customerEmail: user.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Don't clear cart here — it will be cleared on the success page
        // after Stripe confirms the payment via session_id
        window.location.href = data.url;
      } else {
        toast({ title: "Checkout failed", description: data.error || "Please try again.", variant: "error" });
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--elevated)] border-l border-[var(--border)] z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-neon-violet" />
                <h2 className="text-lg font-semibold text-heading">
                  Cart ({itemCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-[var(--hover)] transition-colors"
              >
                <X className="w-5 h-5 text-muted-fg" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-dim-fg mb-4" />
                  <p className="text-heading font-medium">Your cart is empty</p>
                  <p className="text-sm text-muted-fg mt-1">
                    Add some premium products to get started
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.color || ""}-${item.size || ""}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4 p-4 glass rounded-2xl"
                  >
                    {/* Product image */}
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={80} height={80} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-[var(--overlay)] flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-dim-fg" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-heading truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm font-semibold text-neon-violet mt-1">
                        £{item.price}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1, item.color, item.size)
                          }
                          className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--hover)] transition-colors"
                        >
                          <Minus className="w-3 h-3 text-muted-fg" />
                        </button>
                        <span className="text-sm font-medium text-heading w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1, item.color, item.size)
                          }
                          className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--hover)] transition-colors"
                        >
                          <Plus className="w-3 h-3 text-muted-fg" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.color, item.size)}
                      className="self-start p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-fg hover:text-red-400" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-fg">Subtotal</span>
                  <span className="text-lg font-bold text-heading">
                    £{total.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-fg">
                  Shipping & taxes calculated at checkout
                </p>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="magnetic-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? "Processing..." : "Checkout"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-xs text-muted-fg hover:text-heading transition-colors py-2"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
