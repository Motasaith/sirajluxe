"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
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
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const url = `/api/admin/orders?limit=100${filter ? `&status=${filter}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setOrders(data.docs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (e) {
      console.error("Failed to update order:", e);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} orders</p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setLoading(true); }}
          className="px-3 py-2 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-12 text-center">
          <p className="text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-violet-400 font-mono">{order.orderNumber}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-300">{order.customerName || order.customerEmail}</p>
                    {order.customerName && <p className="text-xs text-gray-500">{order.customerEmail}</p>}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{order.items?.length || 0} items</td>
                  <td className="px-5 py-3 text-sm text-white font-medium">£{order.total?.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${statusColors[order.paymentStatus] || statusColors.pending}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className={`appearance-none pl-2 pr-6 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border cursor-pointer focus:outline-none ${statusColors[order.status] || statusColors.pending} bg-transparent`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="bg-[#0a0a0f] text-white">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
