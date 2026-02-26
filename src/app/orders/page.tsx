"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Package,
  Loader2,
  ChevronRight,
  MapPin,
  Calendar,
  CreditCard,
  Check,
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
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    pending: "bg-gray-500/10 text-muted-fg border-[var(--border)]",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        colors[status] || colors["pending"]
      }`}
    >
      {status}
    </span>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const steps = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = steps.indexOf(status);
  const isCancelled = status === "cancelled";

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isCompleted = !isCancelled && i <= currentIndex;
        const isCurrent = !isCancelled && i === currentIndex;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-neon-violet border-neon-violet"
                    : isCancelled && i === 0
                    ? "bg-red-500 border-red-500"
                    : "border-[var(--border)] bg-[var(--overlay)]"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-subtle-fg" />
                )}
              </div>
              <p
                className={`text-[10px] mt-2 font-medium capitalize ${
                  isCurrent
                    ? "text-neon-violet"
                    : isCompleted
                    ? "text-heading"
                    : "text-subtle-fg"
                }`}
              >
                {step === "pending" ? "Ordered" : step}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all ${
                  !isCancelled && i < currentIndex
                    ? "bg-neon-violet"
                    : "bg-[var(--border)]"
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

export default function OrdersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchOrders();
    else if (isLoaded) setLoading(false);
  }, [isSignedIn, isLoaded, fetchOrders]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <PageTransitionProvider>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding">
          {/* Page Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
              My Account
            </p>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-heading mb-4">
              Order <span className="neon-text">History</span>
            </h1>
            <p className="text-lg text-muted-fg max-w-xl">
              Track your orders and view purchase details.
            </p>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
            </div>
          ) : !isSignedIn ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto">
              <Package className="w-12 h-12 text-subtle-fg mx-auto mb-4" />
              <p className="text-heading font-semibold mb-2">Sign in to view orders</p>
              <p className="text-sm text-muted-fg mb-6">
                You need to be signed in to see your order history.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
              >
                Sign In
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto">
              <Package className="w-12 h-12 text-subtle-fg mx-auto mb-4" />
              <p className="text-heading font-semibold mb-2">No orders yet</p>
              <p className="text-sm text-muted-fg mb-6">
                Start shopping to see your orders here.
              </p>
              <Link
                href="/shop"
                className="inline-flex px-6 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order._id}
                  className="glass-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Order Header */}
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )
                    }
                    className="w-full p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--hover)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neon-violet/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-neon-violet" />
                      </div>
                      <div>
                        <p className="text-sm font-mono font-medium text-heading">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-subtle-fg flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-heading">
                          {formatCurrency(order.total)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={order.status} />
                          <StatusBadge status={order.paymentStatus} />
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-subtle-fg transition-transform duration-300 ${
                          expandedOrder === order._id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedOrder === order._id && (
                    <motion.div
                      className="border-t border-[var(--border)] p-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Status Timeline */}
                      <div className="mb-8">
                        <h4 className="text-sm font-semibold text-heading mb-4">
                          Order Progress
                        </h4>
                        <OrderTimeline status={order.status} />
                      </div>

                      {/* Items */}
                      <h4 className="text-sm font-semibold text-heading mb-4">
                        Items
                      </h4>
                      <div className="space-y-3 mb-6">
                        {order.items.map((item, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-4 p-3 rounded-xl bg-[var(--overlay)]"
                          >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-violet/10 to-neon-purple/5 flex items-center justify-center text-sm font-bold text-neon-violet flex-shrink-0">
                              {item.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-heading truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-subtle-fg">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-heading">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neon-violet" />
                            Shipping Address
                          </h4>
                          {order.shippingAddress ? (
                            <div className="text-sm text-muted-fg">
                              <p>{order.shippingAddress.line1}</p>
                              <p>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state}{" "}
                                {order.shippingAddress.postalCode}
                              </p>
                              <p>{order.shippingAddress.country}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-subtle-fg">
                              No address provided
                            </p>
                          )}
                          {order.trackingNumber && (
                            <p className="text-sm text-neon-violet mt-2">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-neon-violet" />
                            Order Summary
                          </h4>
                          <div className="space-y-1 text-sm">
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
                              <span>{formatCurrency(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-heading font-semibold pt-2 border-t border-[var(--border)]">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
