"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Truck,
  Mail,
  User,
  Check,
  Save,
  Printer,
  StickyNote,
} from "lucide-react";
import { toast } from "../../components/toast";
import { ConfirmDialog } from "../../components/confirm-dialog";

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
  customerEmail: string;
  customerName: string;
  clerkUserId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string;
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
  trackingNumber: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
                    ? "bg-violet-500 border-violet-500"
                    : isCancelled && i === 0
                    ? "bg-red-500 border-red-500"
                    : "border-white/[0.06] bg-[#0a0a0f]"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                )}
              </div>
              <p
                className={`text-xs mt-2 font-medium capitalize ${
                  isCurrent ? "text-violet-400" : isCompleted ? "text-white" : "text-gray-600"
                }`}
              >
                {step === "pending" ? "Ordered" : step}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 transition-all ${
                  !isCancelled && i < currentIndex ? "bg-violet-500" : "bg-white/[0.06]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const handleRefund = async () => {
    if (!order) return;
    setRefunding(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder((prev) => prev ? { ...prev, paymentStatus: "refunded", status: "cancelled" } : prev);
        toast(`Refund processed: £${data.amount?.toFixed(2)}`, "success");
      } else {
        toast(data.error || "Refund failed", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setRefunding(false);
      setShowRefundConfirm(false);
    }
  };

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setOrder(data);
        setNewStatus(data.status);
        setTrackingNumber(data.trackingNumber || "");
        setAdminNotes(data.adminNotes || "");
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber,
          adminNotes,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        toast("Order updated successfully", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to update order", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Order not found</h2>
        <button
          onClick={() => router.push("/admin/orders")}
          className="text-violet-400 hover:underline text-sm"
        >
          Back to orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-white">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/10 text-xs transition-colors print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Invoice
          </button>
          {order.paymentStatus === "paid" && (
            <button
              onClick={() => setShowRefundConfirm(true)}
              disabled={refunding}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors disabled:opacity-50 print:hidden"
            >
              {refunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "£"}
              Refund
            </button>
          )}
          <span
            className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${
              statusColors[order.paymentStatus] || statusColors.pending
            }`}
          >
            {order.paymentStatus}
          </span>
          <span
            className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${
              statusColors[order.status] || statusColors.pending
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
        <OrderTimeline status={order.status} />
      </div>

      {/* Update Status */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Update Order</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#111118] text-white text-sm focus:outline-none focus:border-violet-500/50"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Tracking Number</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#111118] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
          {message && (
            <span className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-red-400"}`}>
              {message}
            </span>
          )}
        </div>
      </div>

      {/* Admin Notes */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 print:hidden">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-violet-400" />
          Admin Notes
        </h3>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add internal notes about this order (not visible to customer)..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#111118] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-y"
        />
        <p className="text-[10px] text-gray-600 mt-1">Notes are saved when you click &quot;Save Changes&quot; above.</p>
      </div>

      {/* Customer + Address */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" />
            Customer
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>{order.customerName || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <a href={`mailto:${order.customerEmail}`} className="hover:text-violet-400 transition-colors">
                {order.customerEmail}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <span className="font-mono">ID: {order.clerkUserId}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-400" />
            Shipping Address
          </h3>
          {order.shippingAddress?.line1 ? (
            <div className="text-sm text-gray-300 space-y-1">
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
            <p className="text-sm text-gray-600">No address provided</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-violet-400" />
          Items ({order.items.length})
        </h3>
        <div className="divide-y divide-white/[0.04]">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-400">
                  {item.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-white">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-white/[0.06] mt-4 pt-4">
          <div className="max-w-xs ml-auto space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-white/[0.06]">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showRefundConfirm}
        title="Issue Refund"
        message={`Are you sure you want to issue a full refund of ${formatCurrency(order.total)} for order ${order.orderNumber}? This will refund the customer via Stripe and cancel the order.`}
        confirmLabel="Issue Refund"
        variant="danger"
        loading={refunding}
        onConfirm={handleRefund}
        onCancel={() => setShowRefundConfirm(false)}
      />
    </div>
  );
}
