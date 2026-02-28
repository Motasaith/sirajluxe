"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Users, Search, Download } from "lucide-react";
import { Pagination } from "../components/pagination";
import { toast } from "../components/toast";

interface Customer {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/customers?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      setCustomers(data.docs || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to fetch customers:", e);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  useEffect(() => { setPage(1); }, [search]);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Orders", "Total Spent", "Joined"];
    const rows = customers.map((c) => [
      `${c.firstName} ${c.lastName}`.trim() || "—", c.email, c.orderCount,
      c.totalSpent.toFixed(2), new Date(c.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "customers.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported", "success");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{total} customers</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] text-gray-400 text-sm hover:text-white hover:bg-white/[0.03] transition-colors">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-12 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No customers found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <Link href={`/admin/customers/${c._id}`} className="text-sm text-white font-medium hover:text-violet-400 transition-colors">
                      {c.firstName || c.lastName ? `${c.firstName} ${c.lastName}`.trim() : "—"}
                    </Link>
                    <p className="text-xs text-gray-500 sm:hidden">{c.email}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400 hidden sm:table-cell">{c.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-300">{c.orderCount}</td>
                  <td className="px-5 py-3 text-sm text-white font-medium">£{c.totalSpent.toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
