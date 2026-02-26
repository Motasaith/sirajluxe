"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  // If cart has items, we generally redirect via Stripe from the cart drawer.
  // This page is a fallback for direct navigation.
  useEffect(() => {
    if (items.length === 0) return;
    // If someone lands here with items, send them back to shop
    // They should use the cart drawer checkout flow
  }, [items, router]);

  if (items.length > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neon-violet/10 flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-neon-violet" />
        </div>
        <h1 className="text-2xl font-bold text-heading mb-2 text-center">
          Processing Checkout
        </h1>
        <p className="text-body mb-6 max-w-md text-center">
          Please use the cart to proceed to checkout. You&apos;ll be redirected to our secure payment page.
        </p>
        <div className="flex gap-3">
          <Link
            href="/shop"
            className="px-6 py-3 border border-[var(--border)] text-heading rounded-xl font-medium hover:bg-[var(--hover)] transition-colors"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-neon-violet text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-6">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--overlay)] flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 text-subtle-fg" />
      </div>
      <h1 className="text-2xl font-bold text-heading mb-2 text-center">
        Your Cart is Empty
      </h1>
      <p className="text-body mb-6 max-w-md text-center">
        Looks like you haven&apos;t added anything to your cart yet. Browse our collection to find something you love.
      </p>
      <Link
        href="/shop"
        className="px-6 py-3 bg-neon-violet text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        Browse Products
      </Link>
    </div>
  );
}
