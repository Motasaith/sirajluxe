"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  ShoppingCart,
  DollarSign,
  Send,
} from "lucide-react";
import { toast } from "../../components/toast";

interface Customer {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/customers/${id}`).then((r) => r.json()),
      fetch(`/api/admin/customers/${id}/orders`).then((r) => r.json()),
    ])
      .then(([custData, orderData]) => {
        setCustomer(custData);
        setOrders(orderData.docs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Customer not found</h2>
        <button onClick={() => router.push("/admin/customers")} className="text-violet-400 hover:underline text-sm">
          Back to Customers
        </button>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`.trim() || "Unnamed Customer";

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast("Subject and message are required", "error");
      return;
    }
    setEmailSending(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("Email sent successfully", "success");
        setEmailOpen(false);
        setEmailSubject("");
        setEmailMessage("");
      } else {
        toast(data.error || "Failed to send email", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push("/admin/customers")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </button>

      {/* Customer Card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center">
            <User className="w-7 h-7 text-violet-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-white">{fullName}</h1>
              <button
                onClick={() => setEmailOpen(true)}
                className="flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-lg bg-violet-600/10 text-violet-400 text-sm font-medium hover:bg-violet-600/20 border border-violet-500/20 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send Email
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {customer.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(customer.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Orders</span>
            </div>
            <p className="text-xl font-bold text-white">{customer.orderCount}</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Total Spent</span>
            </div>
            <p className="text-xl font-bold text-white">£{customer.totalSpent.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Avg Order</span>
            </div>
            <p className="text-xl font-bold text-white">
              £{customer.orderCount > 0 ? (customer.totalSpent / customer.orderCount).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Order History</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No orders yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-violet-400 font-mono">
                    <Link href={`/admin/orders/${o._id}`} className="hover:underline">{o.orderNumber}</Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-white font-medium">£{o.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${statusColors[o.status] || statusColors.pending}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Send Email Dialog */}
      {emailOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEmailOpen(false)} />
          <div className="relative bg-[#0d0d12] border border-white/[0.08] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-white font-semibold text-sm mb-4">Send Email to {fullName}</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Your recent order"
                  className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={5}
                  placeholder="Write your message here..."
                  className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEmailOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSendEmail} disabled={emailSending} className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50 flex items-center gap-2">
                {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
