"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Copy, Check, ChevronLeft, ChevronRight, X } from "lucide-react";

interface PublicCoupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description: string;
  expiresAt: string | null;
  minOrderAmount: number;
}

export function PromoBanner() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner this session
    try {
      if (sessionStorage.getItem("promo-banner-dismissed")) {
        setDismissed(true);
        return;
      }
    } catch {}

    fetch("/api/coupons/public")
      .then((r) => r.json())
      .then((data) => {
        if (data.coupons?.length > 0) {
          setCoupons(data.coupons);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-rotate coupons every 5 seconds
  useEffect(() => {
    if (coupons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coupons.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [coupons.length]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {}
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem("promo-banner-dismissed", "1"); } catch {}
  };

  if (dismissed || coupons.length === 0) return null;

  const coupon = coupons[currentIndex];
  const discount =
    coupon.type === "percentage"
      ? `${coupon.value}% OFF`
      : `£${coupon.value.toFixed(2)} OFF`;

  const description =
    coupon.description ||
    (coupon.minOrderAmount > 0
      ? `Use code ${coupon.code} for ${discount} on orders over £${coupon.minOrderAmount.toFixed(2)}`
      : `Use code ${coupon.code} for ${discount}`);

  return (
    <div className="relative z-40">
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-fuchsia-600/90 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 relative">
          {/* Navigation arrows for multiple coupons */}
          {coupons.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + coupons.length) % coupons.length)}
              className="absolute left-2 sm:left-4 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Previous coupon"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 sm:gap-3 text-center"
            >
              <Tag className="w-4 h-4 text-white/80 hidden sm:block flex-shrink-0" />
              <span className="text-white text-xs sm:text-sm font-medium">{description}</span>
              <button
                onClick={() => handleCopy(coupon.code)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold tracking-wider transition-colors border border-white/20"
              >
                {coupon.code}
                {copiedCode === coupon.code ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-70" />
                )}
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows for multiple coupons */}
          {coupons.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % coupons.length)}
              className="absolute right-10 sm:right-12 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Next coupon"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute right-2 sm:right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss promo banner"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          {coupons.length > 1 && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
              {coupons.map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-colors ${
                    i === currentIndex ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
