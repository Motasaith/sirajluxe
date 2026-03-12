"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, User, Shield } from "lucide-react";

interface TicketMessage {
  _id: string;
  sender: "customer" | "admin";
  content: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  messages: TicketMessage[];
  orderId?: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/tickets/${id}`)
      .then((r) => r.json())
      .then(setTicket)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const updateTicket = async (patch: Record<string, string>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (res.ok) setTicket(data);
    } finally {
      setUpdating(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");
      setTicket(data);
      setReply("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm focus:outline-none focus:border-violet-500/50";
  const selectClass = "px-3 py-1.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-sm text-gray-300 focus:outline-none focus:border-violet-500/50 disabled:opacity-50";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/tickets" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p className="text-xs font-mono text-violet-400">{ticket.ticketNumber}</p>
          <h1 className="text-xl font-bold text-white mt-0.5">{ticket.subject}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {ticket.customerName} · {ticket.customerEmail}
          </p>
        </div>
        {ticket.orderId && (
          <Link href={`/admin/orders/${ticket.orderId}`} className="text-xs text-violet-400 hover:underline">
            View Order
          </Link>
        )}
      </div>

      {/* Meta controls */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={ticket.status}
          disabled={updating}
          onChange={(e) => updateTicket({ status: e.target.value })}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select
          value={ticket.priority}
          disabled={updating}
          onChange={(e) => updateTicket({ priority: e.target.value })}
          className={selectClass}
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-gray-500 capitalize">{ticket.category}</span>
      </div>

      {/* Messages */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5 space-y-4 mb-5">
        {ticket.messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.sender === "admin" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "admin" ? "bg-violet-600" : "bg-gray-700"}`}>
              {msg.sender === "admin" ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`flex-1 ${msg.sender === "admin" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`rounded-xl px-4 py-3 text-sm max-w-[85%] ${msg.sender === "admin" ? "bg-violet-600/20 text-white" : "bg-white/[0.04] text-gray-200"}`}>
                {msg.content}
              </div>
              <p className="text-[11px] text-gray-600 mt-1 px-1">
                {msg.sender === "admin" ? "Support Team" : ticket.customerName}
                {msg.createdAt && ` · ${new Date(msg.createdAt).toLocaleString("en-GB")}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply box */}
      {ticket.status !== "closed" && (
        <form onSubmit={sendReply} className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5">
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Reply</label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="Type your reply…"
            className={`${inputClass} resize-none mb-3`}
          />
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => updateTicket({ status: "resolved" })}
              disabled={updating || ticket.status === "resolved"}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              Mark as Resolved
            </button>
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-40 transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Reply
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
