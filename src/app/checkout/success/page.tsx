"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderNumber = searchParams.get("order");
  const paymentIntentParam = searchParams.get("payment_intent");
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  const hasPayment = sessionId || orderNumber || paymentIntentParam;

  // Clear cart once on mount (payment already confirmed by Stripe redirect)
  useEffect(() => {
    if (hasPayment && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [hasPayment, cleared, clearCart]);

  if (!hasPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-6">
          <Loader2 className="w-8 h-8 text-neon-violet animate-spin mx-auto mb-4" />
          <p className="text-muted-fg">Verifying your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-3xl font-bold text-heading mb-3">
          Order Confirmed!
        </h1>
        {orderNumber && (
          <p className="text-sm font-mono text-neon-violet mb-2">Order #{orderNumber}</p>
        )}
        <p className="text-body mb-4 leading-relaxed">
          Thank you for your purchase. Your order is being processed and
          you&apos;ll receive updates via email.
        </p>
        <p className="text-sm text-subtle-fg mb-8">
          Your order will appear in your order history shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="magnetic-btn">
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </span>
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[var(--border-strong)] text-heading hover:bg-[var(--hover)] transition-all duration-300 text-sm font-medium"
          >
            View Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
