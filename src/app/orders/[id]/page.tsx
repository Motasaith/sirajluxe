"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Loader2,
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  Check,
  Truck,
  Copy,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pending: "bg-gray-500/10 text-muted-fg border-[var(--border)]",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
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
                className={`flex-1 h-0.5 mx-3 transition-all ${
                  !isCancelled && i < currentIndex ? "bg-neon-violet" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        );
      })}
      {isCancelled && (
        <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-xs font-medium text-red-400">Cancelled</span>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn, isLoaded } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isSignedIn, isLoaded]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransitionProvider>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back link */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-heading transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : !isSignedIn ? (
            <div className="text-center py-32">
              <Package className="w-12 h-12 text-subtle-fg mx-auto mb-4" />
              <h2 className="text-xl font-bold text-heading mb-2">Sign in to view your order</h2>
              <Link href="/sign-in" className="text-neon-violet hover:underline">
                Sign in
              </Link>
            </div>
          ) : !order ? (
            <div className="text-center py-32">
              <Package className="w-12 h-12 text-subtle-fg mx-auto mb-4" />
              <h2 className="text-xl font-bold text-heading mb-2">Order not found</h2>
              <p className="text-muted-fg mb-4">This order doesn&apos;t exist or doesn&apos;t belong to your account.</p>
              <Link href="/orders" className="text-neon-violet hover:underline">
                View all orders
              </Link>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-heading">Order {order.orderNumber}</h1>
                    <button
                      onClick={copyOrderNumber}
                      className="p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors"
                      title="Copy order number"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-subtle-fg" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-fg">
                    <Calendar className="w-4 h-4" />
                    <span>Placed on {formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                      statusColors[order.status] || statusColors.pending
                    }`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                      statusColors[order.paymentStatus] || statusColors.pending
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                <h3 className="text-sm font-semibold text-heading mb-6">Order Progress</h3>
                <OrderTimeline status={order.status} />
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                <h3 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-neon-violet" />
                  Items ({order.items.length})
                </h3>
                <div className="divide-y divide-[var(--border)]">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-violet/10 to-neon-purple/5 flex items-center justify-center text-sm font-bold text-neon-violet flex-shrink-0">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-heading truncate">{item.name}</p>
                        <p className="text-xs text-subtle-fg mt-1">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-heading">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                  <h3 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neon-violet" />
                    Shipping Address
                  </h3>
                  {order.shippingAddress ? (
                    <div className="text-sm text-muted-fg space-y-1">
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                      <p>
                        {order.shippingAddress.city}
                        {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-subtle-fg">No address provided</p>
                  )}
                  {order.trackingNumber && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Truck className="w-4 h-4 text-neon-violet" />
                        <span className="text-muted-fg">Tracking Number:</span>
                        <span className="text-heading font-mono font-medium">{order.trackingNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingNumber!);
                          }}
                          className="p-1 rounded hover:bg-[var(--hover)] transition-colors"
                          title="Copy tracking number"
                        >
                          <Copy className="w-3.5 h-3.5 text-subtle-fg" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://www.royalmail.com/track-your-item#/tracking-results/${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hover)] border border-[var(--border)] text-xs text-heading font-medium hover:border-neon-violet/30 transition-colors"
                        >
                          Royal Mail <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://www.dhl.com/gb-en/home/tracking/tracking-parcel.html?submit=1&tracking-id=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hover)] border border-[var(--border)] text-xs text-heading font-medium hover:border-neon-violet/30 transition-colors"
                        >
                          DHL <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://www.evri.com/track-a-parcel/${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hover)] border border-[var(--border)] text-xs text-heading font-medium hover:border-neon-violet/30 transition-colors"
                        >
                          Evri <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://www.dpd.co.uk/tracking/quicktrack?search=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hover)] border border-[var(--border)] text-xs text-heading font-medium hover:border-neon-violet/30 transition-colors"
                        >
                          DPD <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment summary */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                  <h3 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-neon-violet" />
                    Payment Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-fg">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-fg">
                      <span>Tax</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="flex justify-between text-muted-fg">
                      <span>Shipping</span>
                      <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-heading font-semibold pt-3 border-t border-[var(--border)]">
                      <span>Total</span>
                      <span className="text-lg">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6 text-center">
                <p className="text-sm text-muted-fg">
                  Need help with this order?{" "}
                  <Link href="/contact" className="text-neon-violet hover:underline">
                    Contact Support
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
