"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { ConfirmDialog } from "../components/confirm-dialog";
import { toast } from "../components/toast";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.docs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      setName("");
      setDescription("");
      fetchCategories();
      toast("Category created", "success");
    } catch (e) {
      console.error("Failed to create category:", e);
      toast("Failed to create category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(confirmDeleteId);
    try {
      await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDeleteId }),
      });
      setCategories((prev) => prev.filter((c) => c._id !== confirmDeleteId));
      toast("Category deleted", "success");
    } catch (e) {
      console.error("Failed to delete:", e);
      toast("Failed to delete category", "error");
    } finally {
      setDeleting(null);
      setConfirmDeleteId(null);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: editName.trim(), description: editDescription.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) => prev.map((c) => (c._id === editingId ? { ...c, name: updated.name, description: updated.description } : c)));
        setEditingId(null);
        toast("Category updated", "success");
      }
    } catch {
      toast("Failed to update category", "error");
    } finally {
      setEditSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div className="flex-1">
            <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-12 text-center">
          <p className="text-gray-400">No categories yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-medium">
                    {editingId === cat._id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} autoFocus />
                    ) : cat.name}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 font-mono hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-5 py-3 text-sm text-gray-400 hidden sm:table-cell">
                    {editingId === cat._id ? (
                      <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={inputClass} />
                    ) : (cat.description || "—")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === cat._id ? (
                        <>
                          <button onClick={handleSaveEdit} disabled={editSaving} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
                            {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-gray-400 hover:bg-white/[0.05] transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(cat._id)}
                            disabled={deleting === cat._id}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            {deleting === cat._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products using it will need to be updated."
        confirmLabel="Delete"
        variant="danger"
        loading={!!deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
