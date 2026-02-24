"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { TiptapEditor } from "../../components/tiptap-editor";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    tags: "",
    rating: 0,
    reviews: 0,
    inStock: true,
    featured: false,
    image: "",
    images: "",
    colors: "",
    sizes: "",
    sku: "",
    inventory: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split(",").map((u) => u.trim()).filter(Boolean) : [],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");
      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">New Product</h1>
            <p className="text-sm text-gray-500 mt-1">Create a new product</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 space-y-5">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Product name" />
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <TiptapEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} placeholder="Product description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price *</label>
                  <input type="number" required min={0} step="0.01" value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelClass}>Original Price</label>
                  <input type="number" min={0} step="0.01" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <input type="text" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="e.g. Footwear, Watches, Audio" />
              </div>

              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="New, Sale, Hot, Limited" />
              </div>

              <div>
                <label className={labelClass}>Image URL</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>

              <div>
                <label className={labelClass}>Additional Image URLs (comma separated)</label>
                <input type="text" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className={inputClass} placeholder="https://..., https://..." />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 space-y-5">
              <div>
                <label className={labelClass}>Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="Auto-generated from name" />
                <p className="text-[11px] text-gray-600 mt-1">Leave empty to auto-generate</p>
              </div>

              <div>
                <label className={labelClass}>SKU</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Inventory</label>
                <input type="number" min={0} value={form.inventory} onChange={(e) => setForm({ ...form, inventory: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">In Stock</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, inStock: !form.inStock })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.inStock ? "bg-violet-600" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.inStock ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Featured</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? "bg-violet-600" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 space-y-5">
              <div>
                <label className={labelClass}>Colors (comma separated)</label>
                <input type="text" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className={inputClass} placeholder="#000, #fff, #8b5cf6" />
              </div>
              <div>
                <label className={labelClass}>Sizes (comma separated)</label>
                <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className={inputClass} placeholder="S, M, L, XL" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Rating</label>
                  <input type="number" min={0} max={5} step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Reviews</label>
                  <input type="number" min={0} value={form.reviews} onChange={(e) => setForm({ ...form, reviews: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
