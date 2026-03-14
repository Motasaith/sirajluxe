"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, X, ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TiptapEditor } from "../../components/tiptap-editor";
import { RelatedProductsSelector } from "@/components/admin/related-products-selector";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState<{ color: string; size: string; sku: string; inventory: number }[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    tags: "",
    inStock: true,
    featured: false,
    image: "",
    images: [] as string[],
    colors: "",
    sizes: "",
    sku: "",
    inventory: 0,
    relatedProducts: [] as string[],
    metaTitle: "",
    metaDescription: "",
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: "cm",
    },
  });

  // Fetch existing categories from categories API
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.docs) {
          const cats = data.docs.map((c: { name: string }) => c.name);
          setCategories(cats);
          if (cats.length > 0 && !form.category) {
            setForm(prev => ({ ...prev, category: cats[0] }));
          }
        }
      })
      .catch(() => { });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload a single image, returns URL or null
  const uploadSingleImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) return null;
    if (file.size > 10 * 1024 * 1024) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return null;
    return data.url as string;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle main image upload via Vercel Blob
  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const url = await uploadSingleImage(file);
      if (!url) throw new Error("Upload failed");
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [uploadSingleImage]);

  // Handle gallery multi-image upload
  const uploadGalleryImages = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
    );
    if (validFiles.length === 0) return;
    setGalleryUploading(true);
    setError("");
    try {
      const urls = await Promise.all(validFiles.map((f) => uploadSingleImage(f)));
      const successful = urls.filter((u): u is string => !!u);
      setForm((prev) => ({ ...prev, images: [...(prev.images as string[]), ...successful] }));
    } catch {
      setError("Some gallery images failed to upload");
    } finally {
      setGalleryUploading(false);
    }
  }, [uploadSingleImage]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) uploadImage(e.dataTransfer.files[0]);
  }, [uploadImage]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadImage(e.target.files[0]);
  }, [uploadImage]);

  const handleGalleryDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragActive(false);
    if (e.dataTransfer.files?.length) uploadGalleryImages(e.dataTransfer.files);
  }, [uploadGalleryImages]);

  const handleGalleryDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setGalleryDragActive(true);
    else if (e.type === "dragleave") setGalleryDragActive(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGalleryFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadGalleryImages(e.target.files);
  }, [uploadGalleryImages]);

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
        images: form.images,
        relatedProducts: form.relatedProducts,
        variants,
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
                <select 
                  required 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  className={inputClass}
                >
                  <option value="" disabled>Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-600 mt-1">Please select from available categories</p>
              </div>

              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="New, Sale, Hot, Limited" />
              </div>

              <div>
                <label className={labelClass}>Product Image</label>
                {form.image ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/[0.06] bg-[#0d0d12]">
                    <div className="relative aspect-video">
                      <Image src={form.image} alt="Product" fill className="object-contain" sizes="600px" />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button type="button" onClick={() => setForm({ ...form, image: "" })} className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-2 border-t border-white/[0.06]">
                      <p className="text-xs text-gray-500 truncate">{form.image}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dragActive ? "border-violet-500 bg-violet-500/10" : "border-white/[0.08] bg-[#0d0d12] hover:border-white/[0.15]"
                      }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm text-gray-300">
                        {uploading ? "Uploading..." : "Drop image here or click to upload"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">PNG, JPG, WebP up to 10MB</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                  </div>
                )}
                <div className="mt-2">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className={inputClass}
                    placeholder="Or paste image URL..."
                  />
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <label className={labelClass}>Gallery Images</label>
                {/* Uploaded gallery previews */}
                {(form.images as string[]).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(form.images as string[]).map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/[0.06] aspect-square bg-[#0d0d12]">
                        <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" sizes="150px" />
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, images: (prev.images as string[]).filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Upload zone */}
                <div
                  onDragEnter={handleGalleryDrag}
                  onDragLeave={handleGalleryDrag}
                  onDragOver={handleGalleryDrag}
                  onDrop={handleGalleryDrop}
                  onClick={() => galleryInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${galleryDragActive ? "border-violet-500 bg-violet-500/10" : "border-white/[0.08] bg-[#0d0d12] hover:border-white/[0.15]"
                    }`}
                >
                  {galleryUploading ? (
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-500" />
                  )}
                  <p className="text-xs text-gray-400">
                    {galleryUploading ? "Uploading..." : "Drop multiple images or click to select"}
                  </p>
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryFileInput} className="hidden" />
                </div>
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
            </div>

            {/* Variant Inventory */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Variant Inventory</h3>
                  <p className="text-[11px] text-gray-600 mt-0.5">Track stock per color/size combination. Leave empty to use global inventory only.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVariants([...variants, { color: "", size: "", sku: "", inventory: 0 }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/10 text-violet-400 text-xs font-medium hover:bg-violet-600/20 border border-violet-500/20 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Variant
                </button>
              </div>
              {variants.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr_1fr_1fr_80px_36px] gap-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider px-1">
                    <span>Color</span>
                    <span>Size</span>
                    <span>SKU</span>
                    <span>Stock</span>
                    <span></span>
                  </div>
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_80px_36px] gap-2 items-center">
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...next[i], color: e.target.value };
                          setVariants(next);
                        }}
                        className={inputClass}
                        placeholder="e.g. Red"
                      />
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...next[i], size: e.target.value };
                          setVariants(next);
                        }}
                        className={inputClass}
                        placeholder="e.g. M"
                      />
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...next[i], sku: e.target.value };
                          setVariants(next);
                        }}
                        className={inputClass}
                        placeholder="SKU"
                      />
                      <input
                        type="number"
                        min={0}
                        value={v.inventory}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...next[i], inventory: parseInt(e.target.value) || 0 };
                          setVariants(next);
                        }}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {form.colors && form.sizes && variants.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const colors = form.colors.split(",").map((c) => c.trim()).filter(Boolean);
                    const sizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
                    const generated: typeof variants = [];
                    for (const color of colors) {
                      for (const size of sizes) {
                        generated.push({ color, size, sku: "", inventory: 0 });
                      }
                    }
                    if (generated.length > 0) setVariants(generated);
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Auto-generate from colors × sizes
                </button>
              )}
            </div>

            {/* Related Products */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white">Related Products</h3>
                <p className="text-[11px] text-gray-600 mt-0.5 mb-4">Select products to show in the &quot;You May Also Like&quot; section.</p>
                <RelatedProductsSelector
                  selectedIds={form.relatedProducts}
                  onChange={(ids: string[]) => setForm({ ...form, relatedProducts: ids })}
                />
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5 space-y-4">
              <h3 className="text-sm font-medium text-white">Shipping</h3>
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" min={0} step="0.01" value={form.weight || ""} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0.00" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Length (cm)</label>
                  <input type="number" min={0} step="0.1" value={form.dimensions.length || ""} onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, length: parseFloat(e.target.value) || 0 } })} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Width (cm)</label>
                  <input type="number" min={0} step="0.1" value={form.dimensions.width || ""} onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, width: parseFloat(e.target.value) || 0 } })} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Height (cm)</label>
                  <input type="number" min={0} step="0.1" value={form.dimensions.height || ""} onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, height: parseFloat(e.target.value) || 0 } })} className={inputClass} placeholder="0" />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5 space-y-4">
              <h3 className="text-sm font-medium text-white">SEO</h3>
              <div>
                <label className={labelClass}>Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inputClass} placeholder="Custom title for search engines" />
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={inputClass} rows={3} placeholder="Custom description for search engines (150-160 chars)" />
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
