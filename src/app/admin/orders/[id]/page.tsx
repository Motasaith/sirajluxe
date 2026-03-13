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
  RotateCcw,
  CheckCircle2,
  XCircle,
  Phone,
  Copy,
  Send,
} from "lucide-react";
import { toast } from "../../components/toast";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface RefundRecord {
  stripeRefundId: string;
  amount: number;
  reason: string;
  type: "full" | "partial";
  date: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  clerkUserId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string;
  promotionName?: string;
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
  trackingCarrier: string;
  trackingUrl: string;
  adminNotes: string;
  returnStatus?: string;
  returnReason?: string;
  returnRequestedAt?: string;
  returnShippingAddress?: string;
  returnCarrier?: string;
  returnInstructions?: string;
  refunds?: RefundRecord[];
  refundedAmount?: number;
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
  partially_refunded: "bg-orange-500/10 text-orange-400 border-orange-500/20",
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
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
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
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [sendingTracking, setSendingTracking] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showApproveReturnModal, setShowApproveReturnModal] = useState(false);
  const [returnShipAddress, setReturnShipAddress] = useState("");
  const [returnShipCarrier, setReturnShipCarrier] = useState("");
  const [returnShipInstructions, setReturnShipInstructions] = useState("");
  const [approvingReturn, setApprovingReturn] = useState(false);
  const [editableItems, setEditableItems] = useState<OrderItem[]>([]);
  const [savingItems, setSavingItems] = useState(false);

  const handleRefund = async () => {
    if (!order) return;
    setRefunding(true);
    try {
      const body: Record<string, unknown> = { reason: refundReason || undefined };
      if (refundType === "partial") {
        const amt = parseFloat(refundAmount);
        if (!amt || amt <= 0) {
          toast("Enter a valid refund amount", "error");
          setRefunding(false);
          return;
        }
        body.amount = amt;
      }
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder((prev) => prev ? {
          ...prev,
          paymentStatus: data.type === "partial" ? "partially_refunded" : "refunded",
          status: data.type === "partial" ? prev.status : "cancelled",
          refundedAmount: (prev.refundedAmount || 0) + (data.amount || 0),
        } : prev);
        toast(`Refund processed: £${data.amount?.toFixed(2)}`, "success");
      } else {
        toast(data.error || "Refund failed", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setRefunding(false);
      setShowRefundConfirm(false);
      setRefundType("full");
      setRefundAmount("");
      setRefundReason("");
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
        setEditableItems(data.items || []);
        setNewStatus(data.status);
        setTrackingNumber(data.trackingNumber || "");
        setTrackingCarrier(data.trackingCarrier || "");
        setTrackingUrl(data.trackingUrl || "");
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
          trackingCarrier,
          trackingUrl,
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

  const handleSendTracking = async () => {
    if (!order || !trackingNumber.trim()) {
      toast("Please enter a tracking number first", "error");
      return;
    }
    setSendingTracking(true);
    try {
      // Save first to persist tracking number
      const saveRes = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber,
          trackingCarrier,
          trackingUrl,
          adminNotes,
          sendTrackingEmail: true,
        }),
      });
      if (saveRes.ok) {
        const updated = await saveRes.json();
        setOrder(updated);
        toast("Tracking notification sent to customer", "success");
      } else {
        const data = await saveRes.json().catch(() => ({}));
        toast(data.error || "Failed to send tracking email", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSendingTracking(false);
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

  const handleSaveItems = async () => {
    if (!order || editableItems.length === 0) return;
    setSavingItems(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: editableItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update items");
      setOrder(data);
      setEditableItems(data.items || []);
      toast("Order items updated", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update items", "error");
    } finally {
      setSavingItems(false);
    }
  };

  const canEditItems = !!order && ["pending", "processing"].includes(order.status);
  const subtotalPreview = editableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountRatio = order && order.subtotal > 0 ? order.discount / order.subtotal : 0;
  const discountPreview = order ? Math.max(0, Math.min(subtotalPreview, subtotalPreview * discountRatio)) : 0;
  const oldTaxBase = order ? Math.max(0, order.subtotal - order.discount) : 0;
  const taxRatio = order && oldTaxBase > 0 ? order.tax / oldTaxBase : 0;
  const taxPreview = Math.max(0, (subtotalPreview - discountPreview) * taxRatio);
  const totalPreview = order ? Math.max(0, subtotalPreview - discountPreview + order.shipping + taxPreview) : 0;

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
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/10 text-xs transition-colors print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Invoice</span>
          </button>
          {(order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded") && (
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
                placeholder="e.g. 300013468629"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#111118] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Carrier / Service Name</label>
            <input
              type="text"
              value={trackingCarrier}
              onChange={(e) => setTrackingCarrier(e.target.value)}
              placeholder="e.g. TCS Express, Royal Mail, DHL"
              className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#111118] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Carrier Tracking URL</label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="e.g. https://www.tcsexpress.com/track/"
              className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#111118] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
            />
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
          <button
            onClick={handleSendTracking}
            disabled={sendingTracking || !trackingNumber.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {sendingTracking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Tracking
          </button>
          <button
            onClick={() => {
              const printWindow = window.open("", "_blank");
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head><title>Shipping Label - ${order.orderNumber}</title></head>
                    <body style="font-family: sans-serif; padding: 40px; max-width: 400px; border: 2px dashed #000; margin: 40px auto; text-align: center;">
                      <h1 style="margin: 0 0 20px 0;">PRIORITY SHIPPING</h1>
                      <div style="font-size: 80px; margin-bottom: 20px;">📦</div>
                      <div style="text-align: left; margin-bottom: 20px;">
                        <strong>SHIP TO:</strong><br/>
                        ${order.customerName}<br/>
                        ${order.shippingAddress?.line1}<br/>
                        ${order.shippingAddress?.line2 ? order.shippingAddress.line2 + '<br/>' : ''}
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}<br/>
                        ${order.shippingAddress?.country}
                      </div>
                      <div style="border-top: 1px solid #000; padding-top: 20px; font-weight: bold; font-family: monospace;">
                        TRACKING: ${order.trackingNumber || 'PENDING'}
                      </div>
                      <script>
                        window.onload = () => window.print();
                      </script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print Label
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

      {/* Return Request */}
      {order.returnStatus && order.returnStatus !== "none" && (
        <div className={`rounded-xl border p-6 ${
          order.returnStatus === "requested" ? "border-amber-500/30 bg-amber-500/5" :
          order.returnStatus === "approved" ? "border-emerald-500/30 bg-emerald-500/5" :
          "border-red-500/30 bg-red-500/5"
        }`}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-violet-400" />
            Return Request
            <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
              order.returnStatus === "requested" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
              order.returnStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {order.returnStatus}
            </span>
          </h3>
          <div className="space-y-2 text-sm text-gray-300 mb-4">
            <p><strong className="text-white">Reason:</strong> {order.returnReason}</p>
            {order.returnRequestedAt && (
              <p><strong className="text-white">Requested:</strong> {new Date(order.returnRequestedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            )}
          </div>
          {order.returnStatus === "requested" && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveReturnModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Return
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/orders/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ returnStatus: "denied" }),
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setOrder(updated);
                      toast("Return denied", "success");
                    } else {
                      toast("Failed to deny", "error");
                    }
                  } catch { toast("Network error", "error"); }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Deny Return
              </button>
            </div>
          )}
          {order.returnStatus === "approved" && order.returnShippingAddress && (
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1 text-sm text-gray-400">
              <p><strong className="text-white">Return address:</strong> {order.returnShippingAddress}</p>
              {order.returnCarrier && <p><strong className="text-white">Courier:</strong> {order.returnCarrier}</p>}
              {order.returnInstructions && <p><strong className="text-white">Instructions:</strong> {order.returnInstructions}</p>}
            </div>
          )}
        </div>
      )}

      {/* Refund History */}
      {order.refunds && order.refunds.length > 0 && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-400" />
            Refund History
            <span className="ml-auto text-xs text-orange-400 font-medium">
              Total refunded: {formatCurrency(order.refundedAmount || 0)}
            </span>
          </h3>
          <div className="divide-y divide-white/[0.04]">
            {order.refunds.map((r, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                      r.type === "full"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}>
                      {r.type} refund
                    </span>
                    <span className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  {r.reason && <p className="text-xs text-gray-400 mt-1">{r.reason}</p>}
                  <p className="text-[10px] text-gray-600 font-mono">{r.stripeRefundId}</p>
                </div>
                <span className="text-sm font-semibold text-white flex-shrink-0">{formatCurrency(r.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer + Address */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" />
            Customer Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-medium text-white">{order.customerName || "—"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <a href={`mailto:${order.customerEmail}`} className="hover:text-violet-400 transition-colors">
                {order.customerEmail}
              </a>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <a href={`tel:${order.customerPhone}`} className="hover:text-violet-400 transition-colors">
                  {order.customerPhone}
                </a>
              </div>
            )}
            <div className="pt-2 border-t border-white/[0.04]">
              <span className="text-xs font-mono text-gray-600">Clerk ID: {order.clerkUserId}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-400" />
              Shipping Address
            </h3>
            {order.shippingAddress?.line1 && (
              <button
                onClick={() => {
                  const addr = [order.customerName, order.shippingAddress.line1, order.shippingAddress.line2, `${order.shippingAddress.city} ${order.shippingAddress.postalCode}`, order.shippingAddress.country].filter(Boolean).join("\n");
                  navigator.clipboard.writeText(addr);
                  setCopiedAddress(true);
                  setTimeout(() => setCopiedAddress(false), 2000);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedAddress ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          {order.shippingAddress?.line1 ? (
            <div className="text-sm text-gray-300 space-y-1">
              <p className="font-medium text-white">{order.customerName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{" "}
                <span className="font-medium text-white">{order.shippingAddress.postalCode}</span>
              </p>
              <p>{order.shippingAddress.country === "GB" ? "United Kingdom" : order.shippingAddress.country}</p>
              {order.customerPhone && <p className="pt-1 text-gray-400">Tel: {order.customerPhone}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No address provided</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-400" />
            Items ({editableItems.length})
          </h3>
          {canEditItems && (
            <button
              onClick={handleSaveItems}
              disabled={savingItems || editableItems.length === 0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-500 disabled:opacity-50"
            >
              {savingItems ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Update Items
            </button>
          )}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {editableItems.map((item, i) => (
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
                {canEditItems ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Qty</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const next = Math.max(1, parseInt(e.target.value || "1", 10));
                        setEditableItems((prev) => prev.map((p, idx) => idx === i ? { ...p, quantity: next } : p));
                      }}
                      className="w-16 px-2 py-1 rounded border border-white/[0.08] bg-[#111118] text-white text-xs"
                    />
                    <button
                      onClick={() => setEditableItems((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                )}
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
              <span>{formatCurrency(canEditItems ? subtotalPreview : order.subtotal)}</span>
            </div>
            {(canEditItems ? discountPreview : order.discount) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>
                  Discount
                  {order.couponCode ? ` (${order.couponCode})` : ""}
                  {order.promotionName ? ` + ${order.promotionName}` : ""}
                </span>
                <span>-{formatCurrency(canEditItems ? discountPreview : order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Tax</span>
              <span>{formatCurrency(canEditItems ? taxPreview : order.tax)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-white/[0.06]">
              <span>Total</span>
              <span>{formatCurrency(canEditItems ? totalPreview : order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partial / Full Refund Modal */}
      {showRefundConfirm && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Issue Refund</h2>
            <p className="text-sm text-gray-400 mb-5">
              Order <span className="text-white font-medium">{order.orderNumber}</span>
            </p>

            {/* Refund type */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Refund type</p>
              <div className="flex gap-3">
                {(["full", "partial"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRefundType(type)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors capitalize ${
                      refundType === type
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-white/[0.08] text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {type === "full"
                      ? `Full — ${formatCurrency(order.total)}`
                      : "Partial"}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount (partial only) */}
            {refundType === "partial" && (
              <div className="mb-5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Amount (£)
                </label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  max={(order.total - (order.refundedAmount || 0)).toFixed(2)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`max ${formatCurrency(order.total - (order.refundedAmount || 0))}`}
                  className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            )}

            {/* Reason */}
            <div className="mb-6">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                Reason (optional)
              </label>
              <textarea
                rows={2}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Item damaged on arrival"
                className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <p className="text-xs text-gray-500 mb-5">
              {refundType === "full"
                ? "A full refund will be issued via Stripe and the order will be cancelled."
                : "A partial refund will be issued via Stripe. The order status will remain unchanged."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRefundConfirm(false);
                  setRefundType("full");
                  setRefundAmount("");
                  setRefundReason("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-gray-300 text-sm hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefund}
                disabled={refunding}
                className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {refunding && <Loader2 className="w-4 h-4 animate-spin" />}
                {refunding ? "Processing..." : "Issue Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Return Modal */}
      {showApproveReturnModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Approve Return</h2>
            <p className="text-sm text-gray-400 mb-5">
              Provide return shipping details for <span className="text-white font-medium">{order.orderNumber}</span>. These will be emailed to the customer.
            </p>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                Return Address <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={returnShipAddress}
                onChange={(e) => setReturnShipAddress(e.target.value)}
                placeholder={"Siraj Luxe Returns\n123 Warehouse Road\nLondon, E1 1AB\nUnited Kingdom"}
                className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                Courier
              </label>
              <input
                type="text"
                value={returnShipCarrier}
                onChange={(e) => setReturnShipCarrier(e.target.value)}
                placeholder="Royal Mail, DPD, Hermes..."
                className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                Additional Instructions (optional)
              </label>
              <textarea
                rows={2}
                value={returnShipInstructions}
                onChange={(e) => setReturnShipInstructions(e.target.value)}
                placeholder="e.g. Write your order number on the outside of the parcel. Keep postage receipt as proof."
                className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowApproveReturnModal(false);
                  setReturnShipAddress("");
                  setReturnShipCarrier("");
                  setReturnShipInstructions("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-gray-300 text-sm hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approvingReturn || !returnShipAddress.trim()}
                onClick={async () => {
                  setApprovingReturn(true);
                  try {
                    const res = await fetch(`/api/admin/orders/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        returnStatus: "approved",
                        returnShippingAddress: returnShipAddress.trim(),
                        returnCarrier: returnShipCarrier.trim(),
                        returnInstructions: returnShipInstructions.trim(),
                      }),
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setOrder(updated);
                      toast("Return approved — customer notified with shipping details", "success");
                      setShowApproveReturnModal(false);
                      setReturnShipAddress("");
                      setReturnShipCarrier("");
                      setReturnShipInstructions("");
                    } else {
                      toast("Failed to approve return", "error");
                    }
                  } catch { toast("Network error", "error"); }
                  finally { setApprovingReturn(false); }
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600/90 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {approvingReturn && <Loader2 className="w-4 h-4 animate-spin" />}
                {approvingReturn ? "Approving..." : "Approve & Notify Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
