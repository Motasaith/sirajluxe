"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, ChevronRight, CircleDot } from "lucide-react";

interface Ticket {
  _id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  messages: unknown[];
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  closed: "bg-gray-700/30 text-gray-500 border-gray-600/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    fetch(`/api/admin/tickets?${params}`)
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, priorityFilter]);

  const selectClass = "px-3 py-1.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-sm text-gray-300 focus:outline-none focus:border-violet-500/50";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={selectClass}>
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <MessageSquare className="w-10 h-10 text-gray-700" />
          <p className="text-sm text-gray-500">No tickets found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {tickets.map((t) => (
                <tr key={t._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-mono text-violet-400">{t.ticketNumber}</p>
                    <p className="text-sm text-white mt-0.5 line-clamp-1">{t.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.messages.length} message{t.messages.length !== 1 ? "s" : ""}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-white">{t.customerName}</p>
                    <p className="text-xs text-gray-500">{t.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="capitalize text-sm text-gray-300">{t.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[t.status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      <CircleDot className="w-2.5 h-2.5" />
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm capitalize font-medium ${PRIORITY_COLORS[t.priority] || "text-gray-400"}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/tickets/${t._id}`} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors inline-flex">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
