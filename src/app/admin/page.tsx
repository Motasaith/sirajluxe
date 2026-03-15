"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Package, ShoppingCart, Users, DollarSign, Loader2, AlertTriangle, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { RevenueChart, StatusDonut, TopProducts } from "./components/charts";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface Trends {
  ordersTrend: number;
  revenueTrend: number;
}

interface LowStockProduct {
  _id: string;
  name: string;
  slug: string;
  inventory: number;
  image: string;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: number; unitsSold: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
      setTrends(data.trends || null);
      setLowStockProducts(data.lowStockProducts || []);
      setRecentOrders(data.recentOrders || []);
      setRevenueByMonth(data.revenueByMonth || []);
      setOrdersByStatus(data.ordersByStatus || {});
      setTopProducts(data.topProducts || []);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  const TrendBadge = ({ value }: { value: number }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? "+" : ""}{value}%
      </span>
    );
  };

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "from-blue-500/20 to-violet-600/5 border-violet-500/20", trend: null },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "from-blue-500/20 to-blue-600/5 border-blue-500/20", trend: trends?.ordersTrend },
    { label: "Customers", value: stats?.totalCustomers || 0, icon: Users, color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20", trend: null },
    { label: "Revenue", value: `£${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "from-amber-500/20 to-amber-600/5 border-amber-500/20", trend: trends?.revenueTrend },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your store</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border bg-gradient-to-br p-5 ${card.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="w-5 h-5 text-gray-400" />
              {card.trend != null && <TrendBadge value={card.trend} />}
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Warnings */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-400">Low Stock Alert</h2>
            <span className="text-xs text-amber-400/60 ml-1">({lowStockProducts.length} products)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <Link
                key={p._id}
                href={`/admin/products/${p._id}/edit`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.name}</p>
                  <p className={`text-xs font-semibold ${p.inventory === 0 ? "text-red-400" : "text-amber-400"}`}>
                    {p.inventory === 0 ? "Out of stock" : `${p.inventory} left`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Revenue (Last 6 Months)</h2>
          <RevenueChart data={revenueByMonth} />
        </div>
        {/* Status Donut */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Orders by Status</h2>
          <StatusDonut data={ordersByStatus} />
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5 mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">Top Products</h2>
        <TopProducts data={topProducts} />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-violet-400 hover:text-violet-300">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-5 py-3 text-sm text-violet-400 font-mono">
                    <Link href={`/admin/orders/${order._id}`} className="hover:underline">{order.orderNumber}</Link>
                    <p className="text-xs text-gray-500 md:hidden truncate max-w-[180px]">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-300 hidden md:table-cell">{order.customerEmail}</td>
                  <td className="px-5 py-3 text-sm text-white font-medium">£{order.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${statusColors[order.status] || statusColors.pending}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
