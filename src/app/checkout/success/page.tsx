"use client";

import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-3xl font-bold text-heading mb-3">
          Order Confirmed!
        </h1>
        <p className="text-body mb-8 leading-relaxed">
          Thank you for your purchase. We&apos;ll send you a confirmation email
          with your order details and tracking information.
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
