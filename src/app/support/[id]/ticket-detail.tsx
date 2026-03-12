"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, User, Shield, CircleDot } from "lucide-react";

interface TicketMessage {
  _id: string;
  sender: "customer" | "admin";
  content: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  messages: TicketMessage[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  closed: "bg-gray-700/30 text-gray-500 border-gray-600/20",
};

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setTicket)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${id}`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-heading font-semibold mb-2">Ticket not found</p>
        <Link href="/support" className="text-neon-violet hover:underline text-sm">
          Back to Support
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/support" className="p-2 rounded-xl text-body hover:text-heading hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p className="text-xs font-mono text-neon-violet">{ticket.ticketNumber}</p>
          <h1 className="text-xl font-bold text-heading mt-0.5">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border capitalize ${STATUS_COLORS[ticket.status] || ""}`}
            >
              <CircleDot className="w-2 h-2" />
              {ticket.status.replace("_", " ")}
            </span>
            <span className="text-xs text-muted-fg capitalize">{ticket.category}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="glass-card p-6 space-y-5">
        {ticket.messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.sender === "admin" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === "admin" ? "bg-neon-violet" : "bg-white/10"
              }`}
            >
              {msg.sender === "admin" ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.sender === "admin"
                    ? "bg-neon-violet/20 text-heading"
                    : "bg-white/[0.05] text-body"
                }`}
              >
                {msg.content}
              </div>
              <p className="text-[11px] text-muted-fg mt-1 px-1">
                {msg.sender === "admin" ? "Support Team" : "You"}
                {msg.createdAt && ` · ${new Date(msg.createdAt).toLocaleString("en-GB")}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {ticket.status !== "closed" ? (
        <form onSubmit={sendReply} className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-heading">Add a Reply</h2>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="Type your reply…"
            className="w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg focus:outline-none focus:border-neon-violet transition-colors text-sm resize-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-violet text-white font-medium hover:shadow-neon transition-all disabled:opacity-60"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Reply
          </button>
        </form>
      ) : (
        <div className="glass-card p-5 text-center">
          <p className="text-body text-sm">This ticket is closed. Open a new ticket if you need further assistance.</p>
          <Link href="/support" className="inline-block mt-3 text-sm text-neon-violet hover:underline">
            Open New Ticket
          </Link>
        </div>
      )}
    </div>
  );
}
