"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, ChevronDown, Search, Download, CheckSquare, Square, CalendarDays } from "lucide-react";
import { Pagination } from "../components/pagination";
import { toast } from "../components/toast";

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
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("processing");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const limit = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/orders?page=${page}&limit=${limit}`;
      if (filter) url += `&status=${filter}`;
      if (paymentFilter) url += `&paymentStatus=${paymentFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (dateFrom) url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
      if (dateTo) url += `&dateTo=${encodeURIComponent(dateTo)}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.docs || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  }, [filter, paymentFilter, search, page, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  useEffect(() => { setPage(1); }, [search, filter, paymentFilter, dateFrom, dateTo]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast("Order status updated", "success");
    } catch (e) {
      console.error("Failed to update order:", e);
      toast("Failed to update order", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkStatus = async () => {
    setBulkUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selected), status: bulkStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk update failed");
      toast(`Updated ${data.count} order${data.count !== 1 ? "s" : ""} to ${bulkStatus}`, "success");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to update orders", "error");
    }
    setSelected(new Set());
    setBulkStatusOpen(false);
    setBulkUpdating(false);
    fetchOrders();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o._id)));
  };

  const exportCSV = () => {
    const headers = ["Order#", "Customer", "Email", "Items", "Total", "Status", "Payment", "Date"];
    const rows = orders.map((o) => [
      o.orderNumber, o.customerName || "", o.customerEmail, o.items?.length || 0,
      o.total?.toFixed(2), o.status, o.paymentStatus, new Date(o.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "orders.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported", "success");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{total} orders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] text-gray-400 text-sm hover:text-white hover:bg-white/[0.03] transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value="">All Payments</option>
            {paymentStatusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 ml-1">
            <CalendarDays className="w-4 h-4 text-gray-500 hidden sm:block" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
              className="px-2 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-gray-400 text-sm focus:outline-none focus:border-violet-500/50 w-36"
            />
            <span className="text-gray-600 text-xs">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
              className="px-2 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-gray-400 text-sm focus:outline-none focus:border-violet-500/50 w-36"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-gray-500 hover:text-white text-xs ml-1 transition-colors"
                title="Clear dates"
              >✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Search + Bulk */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by order number or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => setBulkStatusOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-violet-600/10 text-violet-400 text-sm font-medium hover:bg-violet-600/20 border border-violet-500/20 transition-colors whitespace-nowrap"
          >
            Update ({selected.size})
          </button>
        )}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-3 py-3 text-left">
                    <button onClick={toggleAll} className="text-gray-500 hover:text-white transition-colors">
                      {selected.size === orders.length && orders.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(order._id)} className="text-gray-500 hover:text-white transition-colors">
                        {selected.has(order._id) ? <CheckSquare className="w-4 h-4 text-violet-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-sm text-violet-400 font-mono">
                      <Link href={`/admin/orders/${order._id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-300">{order.customerName || order.customerEmail}</p>
                      {order.customerName && <p className="text-xs text-gray-500">{order.customerEmail}</p>}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 hidden md:table-cell">{order.items?.length || 0} items</td>
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
                    <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
        </div>
      )}

      {/* Bulk Status Dialog */}
      {bulkStatusOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBulkStatusOpen(false)} />
          <div className="relative bg-[#0d0d12] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-white font-semibold text-sm mb-4">Update {selected.size} Orders</h3>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm mb-4 focus:outline-none focus:border-violet-500/50"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBulkStatusOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleBulkStatus} disabled={bulkUpdating} className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50 flex items-center gap-2">
                {bulkUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
