"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

interface Promotion {
  _id: string;
  name: string;
  type: "spend_x_get_pct" | "spend_x_get_off" | "buy_x_get_pct";
  minimumSpend: number;
  minimumItems?: number;
  discountValue: number;
  active: boolean;
  stackable: boolean;
  startDate?: string;
  endDate?: string;
}

const TYPE_LABELS: Record<string, string> = {
  spend_x_get_pct: "Spend X, Get % Off",
  spend_x_get_off: "Spend X, Get Amount Off",
  buy_x_get_pct: "Buy X Items, Get % Off",
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [creating, setCreating] = useState(false);

  const [newPromo, setNewPromo] = useState({
    name: "",
    type: "spend_x_get_pct",
    minimumSpend: 0,
    minimumItems: 0,
    discountValue: 10,
    active: true,
    stackable: false,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetch("/api/admin/promotions")
      .then((r) => r.json())
      .then((d) => setPromotions(d.promotions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const savePromotion = async (promo: Promotion) => {
    setSavingId(promo._id);
    try {
      const res = await fetch(`/api/admin/promotions/${promo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promo),
      });
      const data = await res.json();
      if (res.ok) {
        setPromotions((prev) => prev.map((p) => (p._id === promo._id ? data : p)));
      }
    } finally {
      setSavingId("");
    }
  };

  const createPromotion = async () => {
    if (!newPromo.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromo),
      });
      const data = await res.json();
      if (res.ok) {
        setPromotions((prev) => [data, ...prev]);
        setNewPromo({
          name: "",
          type: "spend_x_get_pct",
          minimumSpend: 0,
          minimumItems: 0,
          discountValue: 10,
          active: true,
          stackable: false,
          startDate: "",
          endDate: "",
        });
      }
    } finally {
      setCreating(false);
    }
  };

  const deletePromotion = async (id: string) => {
    const ok = window.confirm("Delete this promotion?");
    if (!ok) return;
    const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    if (res.ok) setPromotions((prev) => prev.filter((p) => p._id !== id));
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-white/[0.06] bg-[#111118] text-white text-sm focus:outline-none focus:border-violet-500/50";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Promotions</h1>
        <p className="text-sm text-gray-500 mt-1">Create automatic discount rules applied at checkout.</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">New Promotion</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            placeholder="Name"
            value={newPromo.name}
            onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
            className={inputClass}
          />
          <select
            value={newPromo.type}
            onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as Promotion["type"] })}
            className={inputClass}
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step={0.01}
            value={newPromo.discountValue}
            onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
            className={inputClass}
            placeholder="Discount value"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            value={newPromo.minimumSpend}
            onChange={(e) => setNewPromo({ ...newPromo, minimumSpend: Number(e.target.value) })}
            className={inputClass}
            placeholder="Min spend"
          />
          <input
            type="number"
            min={0}
            step={1}
            value={newPromo.minimumItems}
            onChange={(e) => setNewPromo({ ...newPromo, minimumItems: Number(e.target.value) })}
            className={inputClass}
            placeholder="Min items"
          />
          <button
            onClick={createPromotion}
            disabled={creating || !newPromo.name.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-40"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {promotions.map((promo) => (
          <div key={promo._id} className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input
                value={promo.name}
                onChange={(e) => setPromotions((prev) => prev.map((p) => p._id === promo._id ? { ...p, name: e.target.value } : p))}
                className={inputClass}
              />
              <select
                value={promo.type}
                onChange={(e) => setPromotions((prev) => prev.map((p) => p._id === promo._id ? { ...p, type: e.target.value as Promotion["type"] } : p))}
                className={inputClass}
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step={0.01}
                value={promo.minimumSpend}
                onChange={(e) => setPromotions((prev) => prev.map((p) => p._id === promo._id ? { ...p, minimumSpend: Number(e.target.value) } : p))}
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                step={1}
                value={promo.minimumItems || 0}
                onChange={(e) => setPromotions((prev) => prev.map((p) => p._id === promo._id ? { ...p, minimumItems: Number(e.target.value) } : p))}
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={promo.discountValue}
                onChange={(e) => setPromotions((prev) => prev.map((p) => p._id === promo._id ? { ...p, discountValue: Number(e.target.value) } : p))}
                className={inputClass}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => savePromotion(promo)}
                  disabled={savingId === promo._id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-500 disabled:opacity-40"
                >
                  {savingId === promo._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button
                  onClick={() => deletePromotion(promo._id)}
                  className="px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={promo.active}
                  onChange={(e) => setPromotions((prev) => prev.map((p) => p._id === promo._id ? { ...p, active: e.target.checked } : p))}
                />
                Active
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={promo.stackable}
                  onChange={(e) => setPromotions((prev) => prev.map((p) => p._id === promo._id ? { ...p, stackable: e.target.checked } : p))}
                />
                Stackable with coupon
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
