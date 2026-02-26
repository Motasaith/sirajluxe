"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, X, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TiptapEditor } from "../../components/tiptap-editor";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "Siraj Luxe Team",
    category: "General",
    tags: "",
    published: false,
    metaTitle: "",
    metaDescription: "",
  });

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed"); return; }
    setUploading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((prev) => ({ ...prev, coverImage: data.url }));
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Upload failed"); }
    finally { setUploading(false); }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) uploadImage(e.dataTransfer.files[0]);
  }, [uploadImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      router.push("/admin/blog");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider";
  const categories = ["General", "Style Guide", "Product Spotlight", "Behind the Brand", "Tips & Tricks", "News"];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">New Blog Post</h1>
            <p className="text-sm text-gray-500 mt-1">Write a new article</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 space-y-5">
              <div>
                <label className={labelClass}>Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Article title" />
              </div>
              <div>
                <label className={labelClass}>Excerpt *</label>
                <textarea required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Short summary for previews and SEO..." />
              </div>
              <div>
                <label className={labelClass}>Content *</label>
                <TiptapEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} placeholder="Write your article..." />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6 space-y-5">
              <div>
                <label className={labelClass}>Cover Image</label>
                {form.coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/[0.06] bg-[#0d0d12]">
                    <div className="relative aspect-video">
                      <Image src={form.coverImage} alt="Cover" fill className="object-cover" sizes="400px" />
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, coverImage: "" })} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                      dragActive ? "border-violet-500 bg-violet-500/10" : "border-white/[0.08] bg-[#0d0d12] hover:border-white/[0.15]"
                    }`}
                  >
                    {uploading ? <Loader2 className="w-6 h-6 text-violet-400 animate-spin" /> : <ImageIcon className="w-6 h-6 text-gray-500" />}
                    <p className="text-xs text-gray-400">{uploading ? "Uploading..." : "Drop cover image or click"}</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="hidden" />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="Auto-generated from title" />
                <p className="text-[11px] text-gray-600 mt-1">Leave empty to auto-generate</p>
              </div>
              <div>
                <label className={labelClass}>Author</label>
                <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="fashion, tips, premium" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Publish immediately</label>
                <button type="button" onClick={() => setForm({ ...form, published: !form.published })} className={`w-10 h-5 rounded-full transition-colors relative ${form.published ? "bg-violet-600" : "bg-gray-700"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.published ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5 space-y-4">
              <h3 className="text-sm font-medium text-white">SEO</h3>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors" placeholder="Custom title for search engines" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Meta Description</label>
                <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors" rows={3} placeholder="Custom description for search engines (150-160 chars)" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Creating..." : "Create Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
