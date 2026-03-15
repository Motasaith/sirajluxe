"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import {
  Search,
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Copy,
  Check,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface TrackingResult {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  trackingUrl: string | null;
  itemCount: number;
  total: number;
  shipping: number;
  shippingAddress: {
    city: string;
    postalCode: string;
    country: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  { icon: typeof Package; label: string; color: string; bgColor: string; description: string }
> = {
  pending: {
    icon: Clock,
    label: "Order Placed",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    description: "Your order has been received and is awaiting processing.",
  },
  processing: {
    icon: Package,
    label: "Processing",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    description: "Your order is being prepared and packed for shipping.",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
    description: "Your order is on its way! Use the tracking number below to follow your package.",
  },
  delivered: {
    icon: CheckCircle2,
    label: "Delivered",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    description: "Your order has been delivered. Enjoy your purchase!",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    description: "This order has been cancelled. Contact support if you have questions.",
  },
};

function OrderTimeline({ status }: { status: string }) {
  const steps = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = steps.indexOf(status);
  const isCancelled = status === "cancelled";

  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const isCompleted = !isCancelled && i <= currentIndex;
        const isCurrent = !isCancelled && i === currentIndex;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-neon-violet border-neon-violet"
                    : isCancelled && i === 0
                    ? "bg-red-500 border-red-500"
                    : "border-[var(--border)] bg-[var(--overlay)]"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-subtle-fg" />
                )}
              </div>
              <p
                className={`text-xs mt-2 font-medium capitalize ${
                  isCurrent ? "text-neon-violet" : isCompleted ? "text-heading" : "text-subtle-fg"
                }`}
              >
                {step === "pending" ? "Ordered" : step}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-all ${
                  !isCancelled && i < currentIndex ? "bg-neon-violet" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }

      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTracking = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  const config = result ? statusConfig[result.status] || statusConfig.pending : null;
  const StatusIcon = config?.icon || Package;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-violet/20 to-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-neon-violet/20">
              <Truck className="w-8 h-8 text-neon-violet" />
            </div>
            <h1 className="text-3xl font-bold text-heading mb-2">Track Your Order</h1>
            <p className="text-muted-fg">
              Enter your order number and email to check your delivery status
            </p>
          </motion.div>

          {/* Search form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleTrack}
            className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6 mb-8"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                  Order Number *
                </label>
                <input
                  type="text"
                  name="order-number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. SL-ABC12345"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all uppercase tracking-wider font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email used when placing the order"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-heading text-sm placeholder-[var(--dim)] focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/25 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !orderNumber.trim() || !email.trim()}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-neon-violet to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-neon-violet/25 focus:outline-none focus:ring-2 focus:ring-neon-violet/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Looking up order...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </motion.form>

          {/* Results */}
          {result && config && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status card */}
              <div className={`rounded-2xl border p-6 ${config.bgColor}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor}`}>
                    <StatusIcon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-lg font-bold ${config.color}`}>{config.label}</h2>
                    <p className="text-sm text-muted-fg mt-1">{config.description}</p>
                    <p className="text-xs text-subtle-fg mt-2">
                      Order placed {formatDate(result.createdAt)}
                      {result.updatedAt !== result.createdAt && (
                        <> · Last updated {formatDate(result.updatedAt)}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                <h3 className="text-sm font-semibold text-heading mb-6">Order Progress</h3>
                <OrderTimeline status={result.status} />
              </div>

              {/* Tracking number */}
              {result.trackingNumber && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                  <h3 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-neon-violet" />
                    Tracking Information
                  </h3>
                  {result.trackingCarrier && (
                    <p className="text-sm font-semibold text-heading mb-2">{result.trackingCarrier}</p>
                  )}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--elevated)] border border-[var(--border)]">
                    <span className="text-heading font-mono font-medium tracking-wider flex-1">
                      {result.trackingNumber}
                    </span>
                    <button
                      onClick={() => copyTracking(result.trackingNumber!)}
                      className="p-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
                      title="Copy tracking number"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-subtle-fg" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-fg mt-3">
                    Use this tracking number on your carrier&apos;s website to see detailed delivery updates.
                  </p>
                  {result.trackingUrl && (
                    <a
                      href={result.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-neon-violet/10 border border-neon-violet/20 text-sm text-neon-violet font-medium hover:bg-neon-violet/20 transition-colors"
                    >
                      Track on {result.trackingCarrier || "carrier website"} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Order summary */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                <h3 className="text-sm font-semibold text-heading mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Order Number</span>
                    <span className="text-heading font-mono">{result.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Items</span>
                    <span className="text-heading">{result.itemCount} {result.itemCount === 1 ? "item" : "items"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Shipping</span>
                    <span className="text-heading">{result.shipping === 0 ? "Free" : formatCurrency(result.shipping)}</span>
                  </div>
                  {result.shippingAddress && (
                    <div className="flex justify-between">
                      <span className="text-muted-fg flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Delivering to
                      </span>
                      <span className="text-heading">
                        {result.shippingAddress.city}, {result.shippingAddress.postalCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-heading font-semibold">Total</span>
                    <span className="text-heading font-bold text-lg">{formatCurrency(result.total)}</span>
                  </div>
                </div>
              </div>

              {/* View full details link (for signed-in users) */}
              <div className="text-center space-y-3">
                <Link
                  href={`/orders/${result.orderNumber}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm text-heading font-medium hover:bg-[var(--hover)] transition-colors"
                >
                  View Full Order Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-subtle-fg">
                  Need help? <Link href="/contact" className="text-neon-violet hover:underline">Contact Support</Link>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
