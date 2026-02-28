"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight, Edit, Eye, EyeOff } from "lucide-react";
import { ConfirmDialog } from "../components/confirm-dialog";
import { toast } from "../components/toast";

interface CouponDoc {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description: string;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  isPublic: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Edit form state
  const [editCode, setEditCode] = useState("");
  const [editType, setEditType] = useState<"percentage" | "fixed">("percentage");
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMinOrder, setEditMinOrder] = useState("");
  const [editMaxUses, setEditMaxUses] = useState("");
  const [editExpires, setEditExpires] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isPublic, setIsPublic] = useState(false);

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
          description: description.trim(),
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
          maxUses: maxUses ? parseInt(maxUses, 10) : 0,
          expiresAt: expiresAt || null,
          isPublic,
        }),
      });
      if (res.ok) {
        setCode("");
        setValue("");
        setDescription("");
        setMinOrderAmount("");
        setMaxUses("");
        setExpiresAt("");
        setIsPublic(false);
        fetchCoupons();
        toast("Coupon created", "success");
      } else {
        const err = await res.json();
        toast(err.error || "Failed to create coupon", "error");
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

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(confirmDeleteId);
    try {
      await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDeleteId }),
      });
      setCoupons((prev) => prev.filter((c) => c._id !== confirmDeleteId));
      toast("Coupon deleted", "success");
    } catch (e) {
      console.error("Failed to delete coupon:", e);
      toast("Failed to delete coupon", "error");
    } finally {
      setDeleting(null);
      setConfirmDeleteId(null);
    }
  };

  const startEdit = (coupon: CouponDoc) => {
    setEditingId(coupon._id);
    setEditCode(coupon.code);
    setEditType(coupon.type);
    setEditValue(String(coupon.value));
    setEditDescription(coupon.description || "");
    setEditMinOrder(coupon.minOrderAmount > 0 ? String(coupon.minOrderAmount) : "");
    setEditMaxUses(coupon.maxUses > 0 ? String(coupon.maxUses) : "");
    setEditExpires(coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "");
    setEditIsPublic(coupon.isPublic || false);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editCode.trim() || !editValue) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          code: editCode.trim(),
          type: editType,
          value: parseFloat(editValue),
          description: editDescription.trim(),
          minOrderAmount: editMinOrder ? parseFloat(editMinOrder) : 0,
          maxUses: editMaxUses ? parseInt(editMaxUses, 10) : 0,
          expiresAt: editExpires || null,
          isPublic: editIsPublic,
        }),
      });
      if (res.ok) {
        const { doc } = await res.json();
        setCoupons((prev) => prev.map((c) => (c._id === editingId ? doc : c)));
        setEditingId(null);
        toast("Coupon updated", "success");
      } else {
        const err = await res.json();
        toast(err.error || "Failed to update coupon", "error");
      }
    } catch (e) {
      console.error("Failed to update coupon:", e);
      toast("Failed to update coupon", "error");
    } finally {
      setEditSaving(false);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Description (shown to customers if public)</label>
            <input
              type="text"
              placeholder="e.g. Get 20% off your first order!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? "bg-violet-600" : "bg-white/[0.06]"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors flex items-center gap-1.5">
                {isPublic ? <Eye className="w-3.5 h-3.5 text-violet-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                {isPublic ? "Visible on Homepage" : "Hidden (share code manually)"}
              </span>
            </label>
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
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Min Order
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Uses
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Expires
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Visibility
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
                    <td className="px-5 py-3 text-sm text-gray-400 hidden md:table-cell">
                      {coupon.minOrderAmount > 0 ? `£${coupon.minOrderAmount.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 hidden lg:table-cell">
                      {coupon.usedCount}
                      {coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 hidden lg:table-cell">
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
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          coupon.isPublic
                            ? "bg-violet-500/10 text-violet-400"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {coupon.isPublic ? <><Eye className="w-3 h-3" /> Public</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(coupon)}
                          className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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
                          onClick={() => setConfirmDeleteId(coupon._id)}
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

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Coupon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Code</label>
                <input type="text" value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())} className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Type</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value as "percentage" | "fixed")} className={inputClass}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Value {editType === "percentage" ? "(%)" : "(£)"}</label>
                <input type="number" step="0.01" min="0" max={editType === "percentage" ? "100" : undefined} value={editValue} onChange={(e) => setEditValue(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Min Order (£)</label>
                <input type="number" step="0.01" min="0" placeholder="0 = no minimum" value={editMinOrder} onChange={(e) => setEditMinOrder(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Max Uses</label>
                <input type="number" min="0" placeholder="0 = unlimited" value={editMaxUses} onChange={(e) => setEditMaxUses(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Expires At</label>
                <input type="date" value={editExpires} onChange={(e) => setEditExpires(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">Description (shown to customers if public)</label>
              <input type="text" placeholder="e.g. Get 20% off your first order!" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={inputClass} />
            </div>
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setEditIsPublic(!editIsPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsPublic ? "bg-violet-600" : "bg-white/[0.06]"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsPublic ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors flex items-center gap-1.5">
                  {editIsPublic ? <Eye className="w-3.5 h-3.5 text-violet-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {editIsPublic ? "Visible on Homepage" : "Hidden (share code manually)"}
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/[0.06] hover:border-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={editSaving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50">
                {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={!!deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
