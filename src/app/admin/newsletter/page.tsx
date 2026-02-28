"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Mail,
  Users,
  UserMinus,
  Send,
  Trash2,
  MailCheck,
  Search,
  Download,
} from "lucide-react";
import { ConfirmDialog } from "../components/confirm-dialog";

interface Subscriber {
  _id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string;
  subscribedAt: string;
  unsubscribedAt?: string;
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Compose state
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setStats(data.stats || { total: 0, active: 0, unsubscribed: 0 });
    } catch (e) {
      console.error("Failed to fetch subscribers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/newsletter?id=${deleteTarget}`, { method: "DELETE" });
      setSubscribers((prev) => prev.filter((s) => s._id !== deleteTarget));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        active: subscribers.find((s) => s._id === deleteTarget)?.status === "active"
          ? prev.active - 1
          : prev.active,
        unsubscribed: subscribers.find((s) => s._id === deleteTarget)?.status === "unsubscribed"
          ? prev.unsubscribed - 1
          : prev.unsubscribed,
      }));
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          htmlContent: body.trim().replace(/\n/g, "<br/>"),
          textContent: body.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult(data.message);
        setSubject("");
        setBody("");
        setComposing(false);
      } else {
        setSendResult(data.error || "Failed to send");
      }
    } catch {
      setSendResult("Network error");
    } finally {
      setSending(false);
    }
  };

  const handleExport = () => {
    const active = subscribers.filter((s) => s.status === "active");
    const csv = "email,subscribed_at,source\n" +
      active.map((s) => `${s.email},${s.subscribedAt},${s.source}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter((s) => {
    if (filter === "active" && s.status !== "active") return false;
    if (filter === "unsubscribed" && s.status !== "unsubscribed") return false;
    if (search && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage subscribers and send newsletters
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111] border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => { setComposing(!composing); setSendResult(null); }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Compose Newsletter</span>
            <span className="sm:hidden">Compose</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Subscribers", value: stats.total, icon: Mail },
          { label: "Active", value: stats.active, icon: Users },
          { label: "Unsubscribed", value: stats.unsubscribed, icon: UserMinus },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#111] border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Compose Panel */}
      {composing && (
        <div className="bg-[#111] border border-violet-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-violet-400" />
            Compose Newsletter
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            This will be sent to all <strong className="text-white">{stats.active}</strong> active subscribers via email.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. New arrivals just dropped 🔥"
                className="w-full px-4 py-2.5 rounded-lg bg-black border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Body (plain text — line breaks preserved)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Write your newsletter content here..."
                className="w-full px-4 py-2.5 rounded-lg bg-black border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !body.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "Sending…" : `Send to ${stats.active} subscribers`}
              </button>
              <button
                onClick={() => setComposing(false)}
                className="px-4 py-2.5 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Result */}
      {sendResult && (
        <div className={`mb-6 p-4 rounded-lg border text-sm ${
          sendResult.startsWith("Newsletter sent")
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {sendResult}
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex gap-2">
          {(["all", "active", "unsubscribed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-[#111] border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111] border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center">
          <Mail className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">
            {subscribers.length === 0
              ? "No subscribers yet"
              : "No subscribers match your filter"}
          </p>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Source</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr
                  key={sub._id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-white font-medium">{sub.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        sub.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 capitalize hidden md:table-cell">{sub.source}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                    {new Date(sub.subscribedAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setDeleteTarget(sub._id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Remove subscriber"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Subscriber"
        message="Are you sure you want to permanently remove this subscriber? This action cannot be undone."
        confirmLabel="Remove"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
