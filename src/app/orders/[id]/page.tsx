"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  RotateCcw,
  AlertTriangle,
  Clock,
  X,
  FileText,
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
  trackingCarrier?: string;
  trackingUrl?: string;
  returnStatus?: string;
  returnReason?: string;
  returnRequestedAt?: string;
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
  const searchParams = useSearchParams();
  const guestEmail = searchParams?.get("guest_email");
  const { isSignedIn, isLoaded } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Return request state
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnDetails, setReturnDetails] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn && !guestEmail) {
      setLoading(false);
      return;
    }

    const fetchUrl = guestEmail 
      ? `/api/orders/${id}?guest_email=${encodeURIComponent(guestEmail)}`
      : `/api/orders/${id}`;

    fetch(fetchUrl)
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

  // Check if order is eligible for return (delivered, paid, within 7 days, no existing request)
  const isReturnEligible = order
    && order.status === "delivered"
    && order.paymentStatus === "paid"
    && (!order.returnStatus || order.returnStatus === "none")
    && (() => {
      const delivered = new Date(order.updatedAt);
      const daysSince = Math.floor((Date.now() - delivered.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 7;
    })();

  const daysLeftForReturn = order ? (() => {
    const delivered = new Date(order.updatedAt);
    const daysSince = Math.floor((Date.now() - delivered.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysSince);
  })() : 0;

  const handleReturnSubmit = async () => {
    if (!order || !returnReason) return;
    setSubmittingReturn(true);
    setReturnError("");
    setReturnSuccess("");
    try {
      const returnUrl = guestEmail
        ? `/api/orders/${order._id}/return?guest_email=${encodeURIComponent(guestEmail)}`
        : `/api/orders/${order._id}/return`;
        
      const res = await fetch(returnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: returnReason, details: returnDetails.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setReturnSuccess(data.message);
        setOrder((prev) => prev ? { ...prev, returnStatus: "requested", returnReason: returnDetails ? `${returnReason}: ${returnDetails}` : returnReason, returnRequestedAt: new Date().toISOString() } : prev);
        setShowReturnForm(false);
      } else {
        setReturnError(data.error || "Failed to submit return request");
      }
    } catch {
      setReturnError("Something went wrong. Please try again.");
    } finally {
      setSubmittingReturn(false);
    }
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
                  {order.paymentStatus === "paid" && (
                    <Link
                      href={`/orders/${order._id}/invoice`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border)] text-heading hover:bg-[var(--hover)] hover:border-neon-violet/30 transition-all"
                      title="View Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Invoice
                    </Link>
                  )}
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
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Truck className="w-4 h-4 text-neon-violet" />
                        {order.trackingCarrier ? (
                          <span className="text-heading font-semibold">{order.trackingCarrier}</span>
                        ) : (
                          <span className="text-muted-fg">Tracking Number:</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-3">
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
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-violet/10 border border-neon-violet/20 text-sm text-neon-violet font-medium hover:bg-neon-violet/20 transition-colors"
                        >
                          Track on {order.trackingCarrier || "carrier website"} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
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

              {/* Return Request Section */}
              {order.returnStatus && order.returnStatus !== "none" && (
                <div className={`rounded-2xl border p-6 ${
                  order.returnStatus === "requested" ? "border-amber-500/20 bg-amber-500/5" :
                  order.returnStatus === "approved" ? "border-emerald-500/20 bg-emerald-500/5" :
                  "border-red-500/20 bg-red-500/5"
                }`}>
                  <h3 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-neon-violet" />
                    Return Request
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                      order.returnStatus === "requested" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      order.returnStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {order.returnStatus === "requested" ? "Under Review" : order.returnStatus}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-fg">{order.returnReason}</p>
                  {order.returnRequestedAt && (
                    <p className="text-xs text-subtle-fg mt-2">
                      Requested on {new Date(order.returnRequestedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  {order.returnStatus === "requested" && (
                    <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      We&apos;ll review your request within 1-2 business days.
                    </p>
                  )}
                  {order.returnStatus === "approved" && (
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Your return has been approved. A refund will be processed shortly.
                    </p>
                  )}
                </div>
              )}

              {returnSuccess && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-400">{returnSuccess}</p>
                </div>
              )}

              {/* Return Request Button & Form */}
              {isReturnEligible && !returnSuccess && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
                  {!showReturnForm ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-neon-violet" />
                          Need to Return This Order?
                        </h3>
                        <p className="text-xs text-muted-fg mt-1">
                          You have <strong className="text-heading">{daysLeftForReturn} day{daysLeftForReturn !== 1 ? "s" : ""}</strong> left to request a return for damage or loss.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowReturnForm(true)}
                        className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium text-heading hover:bg-[var(--hover)] transition-all flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Request Return
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-neon-violet" />
                          Request a Return
                        </h3>
                        <button onClick={() => { setShowReturnForm(false); setReturnError(""); }} className="p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors">
                          <X className="w-4 h-4 text-subtle-fg" />
                        </button>
                      </div>

                      {returnError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {returnError}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-muted-fg block mb-2">Reason for return *</label>
                        <div className="space-y-2">
                          {["Damaged on arrival", "Item lost in transit", "Wrong item received", "Item defective", "Other"].map((reason) => (
                            <label key={reason} onClick={() => setReturnReason(reason)} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                returnReason === reason ? "border-neon-violet bg-neon-violet" : "border-[var(--border)] group-hover:border-neon-violet/50"
                              }`}>
                                {returnReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="text-sm text-body">{reason}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-fg block mb-1">Additional details (optional)</label>
                        <textarea
                          value={returnDetails}
                          onChange={(e) => setReturnDetails(e.target.value)}
                          maxLength={500}
                          rows={3}
                          placeholder="Please describe the issue..."
                          className="w-full px-3 py-2 rounded-lg bg-[var(--overlay)] border border-[var(--border)] text-heading text-sm focus:outline-none focus:border-neon-violet/50 focus:ring-2 focus:ring-neon-violet/20 transition-all resize-none placeholder:text-subtle-fg"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleReturnSubmit}
                          disabled={!returnReason || submittingReturn}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-violet to-neon-purple text-white text-sm font-medium hover:shadow-lg hover:shadow-neon-violet/25 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {submittingReturn ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          Submit Request
                        </button>
                        <button
                          onClick={() => { setShowReturnForm(false); setReturnError(""); }}
                          className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm text-muted-fg hover:text-heading hover:bg-[var(--hover)] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* What Happens Next — shown when order is not yet delivered and no tracking */}
              {(order.status === "pending" || order.status === "processing" || (order.status === "shipped" && !order.trackingNumber)) && (
                <div className="rounded-2xl border border-neon-violet/10 bg-gradient-to-br from-neon-violet/[0.03] to-transparent p-6">
                  <h3 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neon-violet" />
                    What Happens Next?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        order.status === "pending" ? "bg-neon-violet text-white" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {order.status !== "pending" ? <Check className="w-3.5 h-3.5" /> : "1"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">Order Received</p>
                        <p className="text-xs text-muted-fg mt-0.5">We&apos;ve received your order and payment has been confirmed.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        order.status === "processing" ? "bg-neon-violet text-white" : order.status === "shipped" ? "bg-emerald-500/10 text-emerald-400" : "bg-[var(--overlay)] border border-[var(--border)] text-subtle-fg"
                      }`}>
                        {order.status === "shipped" ? <Check className="w-3.5 h-3.5" /> : "2"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">Processing &amp; Packing</p>
                        <p className="text-xs text-muted-fg mt-0.5">Our team is carefully preparing your items for dispatch. This usually takes 1–2 business days.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-[var(--overlay)] border border-[var(--border)] text-subtle-fg">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">Tracking ID Assigned</p>
                        <p className="text-xs text-muted-fg mt-0.5">Once shipped, you&apos;ll receive an email with your tracking number. It will also appear here so you can track your parcel in real time.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-[var(--overlay)] border border-[var(--border)] text-subtle-fg">
                        4
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">Delivered</p>
                        <p className="text-xs text-muted-fg mt-0.5">Estimated delivery is 3–5 business days. After delivery, you have 7 days to request a return if needed.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-subtle-fg flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      We&apos;ll send email updates at every step. Check your inbox (and spam folder) for notifications from Siraj Luxe.
                    </p>
                  </div>
                </div>
              )}

              {/* Help */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6 text-center">
                <p className="text-sm text-muted-fg">
                  Need help with this order?{" "}
                  <Link href="/contact" className="text-neon-violet hover:underline">
                    Contact Support
                  </Link>
                  {" · "}
                  <Link href="/returns" className="text-neon-violet hover:underline">
                    Returns Policy
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
