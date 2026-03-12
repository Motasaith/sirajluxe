"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Loader2,
  Plus,
  ChevronRight,
  MessageSquare,
  Send,
  X,
  CircleDot,
} from "lucide-react";

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  messages: unknown[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  closed: "bg-gray-700/30 text-gray-500 border-gray-600/20",
};

export function SupportTickets() {
  const { isSignedIn, isLoaded } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    subject: "",
    category: "other",
    orderId: "",
    message: "",
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setTickets((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ subject: "", category: "other", orderId: "", message: "" });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading placeholder:text-muted-fg focus:outline-none focus:border-neon-violet transition-colors text-sm";

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 text-neon-violet animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="glass-card p-10 text-center">
        <MessageSquare className="w-10 h-10 text-neon-violet mx-auto mb-4" />
        <p className="text-heading font-semibold mb-2">Sign in to view your tickets</p>
        <p className="text-body mb-6">Create a free account to open support requests and track their status.</p>
        <Link
          href="/sign-in?redirect=/support"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-violet text-white font-medium hover:shadow-neon transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Ticket button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-violet text-white text-sm font-medium hover:shadow-neon transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Ticket"}
        </button>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-heading">New Support Request</h2>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Subject *</label>
            <input
              required
              type="text"
              maxLength={200}
              placeholder="Brief description of your issue"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                <option value="order">Order</option>
                <option value="product">Product</option>
                <option value="shipping">Shipping</option>
                <option value="return">Return / Refund</option>
                <option value="payment">Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">
                Order Number <span className="text-muted-fg">(optional)</span>
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="e.g. SL-12345"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Message *</label>
            <textarea
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              placeholder="Please describe your issue in detail…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-violet text-white font-medium hover:shadow-neon transition-all disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Ticket
          </button>
        </form>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-heading font-medium mb-1">No support tickets yet</p>
          <p className="text-body text-sm">
            Open a new ticket above and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t._id}
              href={`/support/${t._id}`}
              className="glass-card p-5 flex items-center gap-4 hover:border-neon-violet/30 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-mono text-neon-violet">{t.ticketNumber}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border capitalize ${STATUS_COLORS[t.status] || ""}`}
                  >
                    <CircleDot className="w-2 h-2" />
                    {t.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm font-medium text-heading truncate">{t.subject}</p>
                <p className="text-xs text-body mt-0.5">
                  {t.messages.length} message{t.messages.length !== 1 ? "s" : ""} ·{" "}
                  {new Date(t.createdAt).toLocaleDateString("en-GB")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
