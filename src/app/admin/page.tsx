"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit3,
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  DollarSign,
  Box,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Package, label: "Products", active: false },
  { icon: ShoppingCart, label: "Orders", active: false },
  { icon: Users, label: "Customers", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const stats = [
  {
    title: "Total Revenue",
    value: "$48,295",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "1,284",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Active Products",
    value: "342",
    change: "+3.1%",
    trend: "up",
    icon: Box,
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "-0.4%",
    trend: "down",
    icon: TrendingUp,
  },
];

const recentOrders = [
  {
    id: "#ORD-001",
    customer: "Sarah Chen",
    product: "Obsidian Pro Sneakers",
    amount: "$299",
    status: "Delivered",
  },
  {
    id: "#ORD-002",
    customer: "Marcus Webb",
    product: "Quantum Chronograph",
    amount: "$1,299",
    status: "Processing",
  },
  {
    id: "#ORD-003",
    customer: "Aisha Patel",
    product: "Nebula Wireless Earbuds",
    amount: "$349",
    status: "Shipped",
  },
  {
    id: "#ORD-004",
    customer: "James Liu",
    product: "Phantom Leather Jacket",
    amount: "$899",
    status: "Pending",
  },
  {
    id: "#ORD-005",
    customer: "Emma Davis",
    product: "Aether Sunglasses",
    amount: "$459",
    status: "Delivered",
  },
];

const topProducts = [
  { name: "Obsidian Pro Sneakers", sales: 847, revenue: "$253,153" },
  { name: "Quantum Chronograph", sales: 423, revenue: "$549,877" },
  { name: "Nebula Wireless Earbuds", sales: 1231, revenue: "$429,619" },
  { name: "Phantom Leather Jacket", sales: 234, revenue: "$210,366" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Pending: "bg-gray-500/10 text-muted-fg border-[var(--border)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        colors[status] || colors["Pending"]
      }`}
    >
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full glass-heavy !rounded-none lg:!rounded-r-3xl flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet to-neon-purple flex items-center justify-center shadow-neon">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <span className="text-lg font-semibold text-heading">
                  BinaCodes
                </span>
                <span className="block text-[10px] text-subtle-fg tracking-widest uppercase">
                  Admin Panel
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-muted-fg hover:text-heading"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTab === item.label
                        ? "bg-neon-violet/10 text-neon-violet border border-neon-violet/20"
                        : "text-muted-fg hover:text-heading hover:bg-[var(--hover)]"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom */}
          <div className="p-4">
            <div className="glass-card p-4 !rounded-2xl">
              <p className="text-xs text-muted-fg mb-2">Storage Used</p>
              <div className="w-full h-2 rounded-full bg-surface mb-2">
                <div className="w-[65%] h-full rounded-full bg-gradient-to-r from-neon-violet to-neon-purple" />
              </div>
              <p className="text-xs text-subtle-fg">6.5 GB of 10 GB</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass !rounded-none px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted-fg hover:text-heading"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-heading">
                {activeTab}
              </h1>
              <p className="text-xs text-subtle-fg">
                Welcome back, Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--overlay)] border border-[var(--border)]">
              <Search className="w-4 h-4 text-subtle-fg" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-heading placeholder:text-subtle-fg focus:outline-none w-40"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl text-muted-fg hover:text-heading hover:bg-[var(--hover)] transition-all duration-300">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-violet" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--hover)] transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-violet to-neon-purple flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <ChevronDown className="w-4 h-4 text-subtle-fg" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-neon-violet" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === "up"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-heading mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-subtle-fg">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders Table */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-heading">
                  Recent Orders
                </h3>
                <button className="text-xs text-neon-violet hover:text-neon-glow transition-colors flex items-center gap-1">
                  View All <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left text-xs font-medium text-subtle-fg uppercase tracking-wider pb-3">
                        Order
                      </th>
                      <th className="text-left text-xs font-medium text-subtle-fg uppercase tracking-wider pb-3">
                        Customer
                      </th>
                      <th className="text-left text-xs font-medium text-subtle-fg uppercase tracking-wider pb-3 hidden sm:table-cell">
                        Product
                      </th>
                      <th className="text-left text-xs font-medium text-subtle-fg uppercase tracking-wider pb-3">
                        Amount
                      </th>
                      <th className="text-left text-xs font-medium text-subtle-fg uppercase tracking-wider pb-3">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-subtle-fg uppercase tracking-wider pb-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-[var(--hover)] transition-colors"
                      >
                        <td className="py-4 text-sm font-mono text-body">
                          {order.id}
                        </td>
                        <td className="py-4 text-sm text-heading">
                          {order.customer}
                        </td>
                        <td className="py-4 text-sm text-muted-fg hidden sm:table-cell">
                          {order.product}
                        </td>
                        <td className="py-4 text-sm font-medium text-heading">
                          {order.amount}
                        </td>
                        <td className="py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-lg text-subtle-fg hover:text-heading hover:bg-[var(--hover)]">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg text-subtle-fg hover:text-heading hover:bg-[var(--hover)]">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-heading">
                  Top Products
                </h3>
                <button className="text-xs text-neon-violet hover:text-neon-glow transition-colors flex items-center gap-1">
                  Details <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--hover)] transition-colors"
                  >
                    <span className="text-lg font-bold text-dim-fg w-6">
                      {i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet/10 to-neon-purple/5 flex items-center justify-center text-sm font-bold text-neon-violet">
                      {product.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-heading truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-subtle-fg">
                        {product.sales} sales
                      </p>
                    </div>
                    <span className="text-sm font-medium text-body">
                      {product.revenue}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Product Button */}
              <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-[var(--border-strong)] text-sm text-subtle-fg hover:text-neon-violet hover:border-neon-violet/30 transition-all duration-300 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
