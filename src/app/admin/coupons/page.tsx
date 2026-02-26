"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface CouponDoc {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchCoupons = () => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((data) => setCoupons(data.docs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          type,
          value: parseFloat(value),
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
          maxUses: maxUses ? parseInt(maxUses, 10) : 0,
          expiresAt: expiresAt || null,
        }),
      });
      if (res.ok) {
        setCode("");
        setValue("");
        setMinOrderAmount("");
        setMaxUses("");
        setExpiresAt("");
        fetchCoupons();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create coupon");
      }
    } catch (e) {
      console.error("Failed to create coupon:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: CouponDoc) => {
    setToggling(coupon._id);
    try {
      await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon._id, active: !coupon.active }),
      });
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, active: !c.active } : c))
      );
    } catch (e) {
      console.error("Failed to toggle coupon:", e);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      console.error("Failed to delete coupon:", e);
    } finally {
      setDeleting(null);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors";

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage discount codes</p>
      </div>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Code</label>
            <input
              type="text"
              placeholder="e.g. SAVE20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
              className={inputClass}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Value {type === "percentage" ? "(%)" : "(£)"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={type === "percentage" ? "100" : undefined}
              placeholder={type === "percentage" ? "e.g. 20" : "e.g. 5.00"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Min Order (£)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0 = no minimum"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Max Uses</label>
            <input
              type="number"
              min="0"
              placeholder="0 = unlimited"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Expires At</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Coupon
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-12 text-center">
          <p className="text-gray-400">No coupons yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Order
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uses
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-sm text-white font-mono font-medium">
                      {coupon.code}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 capitalize">{coupon.type}</td>
                    <td className="px-5 py-3 text-sm text-white">
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : `£${coupon.value.toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {coupon.minOrderAmount > 0 ? `£${coupon.minOrderAmount.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {coupon.usedCount}
                      {coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          coupon.active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {coupon.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(coupon)}
                          disabled={toggling === coupon._id}
                          className="p-2 rounded-lg text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
                          title={coupon.active ? "Deactivate" : "Activate"}
                        >
                          {toggling === coupon._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : coupon.active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          disabled={deleting === coupon._id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {deleting === coupon._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
