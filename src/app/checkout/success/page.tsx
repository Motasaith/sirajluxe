"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingBag, Loader2, Package, Truck, Bell, Clock } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderNumber = searchParams.get("order");
  const paymentIntentParam = searchParams.get("payment_intent");
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);
  const [verified, setVerified] = useState(false);

  const hasPayment = sessionId || orderNumber || paymentIntentParam;

  // Clear cart once on mount (payment already confirmed by Stripe redirect)
  useEffect(() => {
    if (hasPayment && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [hasPayment, cleared, clearCart]);

  // Verify payment & trigger confirmation email (fallback when webhooks aren't configured)
  useEffect(() => {
    if (paymentIntentParam && !verified) {
      setVerified(true);
      fetch("/api/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntentParam }),
      }).catch(() => {
        // Silent — webhook may handle it instead
      });
    }
  }, [paymentIntentParam, verified]);

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
        <p className="text-body mb-8 leading-relaxed">
          Thank you for your purchase! We&apos;ve sent a confirmation email with your order details.
        </p>

        {/* What Happens Next */}
        <div className="text-left bg-[var(--overlay)] border border-[var(--border)] rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-heading mb-4">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-heading">Processing</p>
                <p className="text-xs text-muted-fg">We&apos;re preparing your order. Takes 1–2 business days.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-heading">Tracking ID</p>
                <p className="text-xs text-muted-fg">You&apos;ll receive an email with your tracking number once shipped.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-heading">Email Updates</p>
                <p className="text-xs text-muted-fg">We&apos;ll notify you at every step — shipped, out for delivery, and delivered.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-neon-violet/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-neon-violet" />
              </div>
              <div>
                <p className="text-sm font-medium text-heading">Delivery</p>
                <p className="text-xs text-muted-fg">Estimated 3–5 business days. Track your order anytime from your orders page.</p>
              </div>
            </div>
          </div>
        </div>

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
