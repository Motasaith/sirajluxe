"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Filter, Package, ShoppingCart, Settings, FileText, RefreshCw } from "lucide-react";
import { Pagination } from "../components/pagination";

interface ActivityItem {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  adminEmail: string;
  createdAt: string;
}

const entityIcons: Record<string, React.ElementType> = {
  product: Package,
  order: ShoppingCart,
  settings: Settings,
  blog: FileText,
};

const actionColors: Record<string, string> = {
  create: "text-emerald-400 bg-emerald-500/10",
  update: "text-blue-400 bg-blue-500/10",
  delete: "text-red-400 bg-red-500/10",
};

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityFilter, setEntityFilter] = useState("");

  const fetchActivity = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (entityFilter) params.set("entity", entityFilter);
    fetch(`/api/admin/activity?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.docs || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, entityFilter]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const formatTime = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const entities = ["", "product", "order", "settings", "blog"];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-sm text-gray-500 mt-1">{total} activities logged</p>
        </div>
        <button
          onClick={fetchActivity}
          className="p-2 rounded-lg border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-500" />
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#0d0d12] border border-white/[0.06]">
          {entities.map((e) => (
            <button
              key={e}
              onClick={() => { setEntityFilter(e); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                entityFilter === e
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {e || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-12 text-center">
          <p className="text-gray-400">No activity logged yet</p>
          <p className="text-sm text-gray-600 mt-1">Admin actions will appear here as they happen.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {items.map((item) => {
              const Icon = entityIcons[item.entity] || Package;
              const colorClass = actionColors[item.action] || "text-gray-400 bg-white/[0.04]";
              return (
                <div key={item._id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${colorClass}`}>
                        {item.action}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{item.entity}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 truncate">{item.details || "—"}</p>
                    {item.adminEmail && (
                      <p className="text-[10px] text-gray-600 mt-0.5">by {item.adminEmail}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">{formatTime(item.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
      </div>
    </div>
  );
}
