"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Loader2, Upload, Trash2, Copy, Check, ImageIcon, Search, Pencil } from "lucide-react";
import { ConfirmDialog } from "../components/confirm-dialog";
import { toast } from "../components/toast";

interface MediaFile {
  _id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  alt: string;
  createdAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<MediaFile | null>(null);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altValue, setAltValue] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => setMedia(data.docs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return media;
    const q = search.toLowerCase();
    return media.filter(
      (f) =>
        f.filename.toLowerCase().includes(q) ||
        f.alt?.toLowerCase().includes(q)
    );
  }, [media, search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const newMedia = await res.json();
          setMedia((prev) => [newMedia, ...prev]);
        }
      }
      toast("Upload complete", "success");
    } catch (e) {
      console.error("Upload failed:", e);
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteFile) return;
    setDeleting(true);
    try {
      await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDeleteFile._id, url: confirmDeleteFile.url }),
      });
      setMedia((prev) => prev.filter((m) => m._id !== confirmDeleteFile._id));
      toast("File deleted", "success");
    } catch (e) {
      console.error("Delete failed:", e);
      toast("Failed to delete file", "error");
    } finally {
      setDeleting(false);
      setConfirmDeleteFile(null);
    }
  };

  const handleSaveAlt = async (id: string) => {
    setSavingAlt(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, alt: altValue }),
      });
      if (res.ok) {
        setMedia((prev) => prev.map((m) => (m._id === id ? { ...m, alt: altValue } : m)));
        setEditingAlt(null);
        toast("Alt text updated", "success");
      }
    } catch {
      toast("Failed to update alt text", "error");
    } finally {
      setSavingAlt(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    toast("URL copied", "info");
    setTimeout(() => setCopied(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} files</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by filename or alt text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      <p className="text-xs text-gray-600 mb-6">
        Files are stored in Vercel Blob Storage. Set BLOB_READ_WRITE_TOKEN in your environment variables.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] border-dashed bg-[#0a0a0f] p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            {media.length === 0 ? "No files uploaded" : "No matching files"}
          </p>
          {media.length === 0 && (
            <p className="text-sm text-gray-600">Upload images to use in your products</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((file) => (
            <div
              key={file._id}
              className="group rounded-xl border border-white/[0.06] bg-[#0a0a0f] overflow-hidden"
            >
              {/* Preview */}
              <div className="aspect-square relative bg-[#0d0d12] flex items-center justify-center">
                {file.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt={file.alt} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                )}
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title="Copy URL"
                  >
                    {copied === file.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingAlt(file._id);
                      setAltValue(file.alt || "");
                    }}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title="Edit Alt Text"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteFile(file)}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-gray-300 truncate">{file.filename}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{formatSize(file.size)}</p>
                {editingAlt === file._id ? (
                  <div className="mt-2 flex gap-1">
                    <input
                      type="text"
                      value={altValue}
                      onChange={(e) => setAltValue(e.target.value)}
                      placeholder="Alt text..."
                      className="flex-1 px-2 py-1 rounded text-xs bg-[#0d0d12] border border-white/[0.06] text-white focus:outline-none focus:border-violet-500/50"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveAlt(file._id);
                        if (e.key === "Escape") setEditingAlt(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveAlt(file._id)}
                      disabled={savingAlt}
                      className="px-2 py-1 rounded text-xs bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
                    >
                      {savingAlt ? "..." : "Save"}
                    </button>
                  </div>
                ) : file.alt ? (
                  <p className="text-[10px] text-gray-500 mt-1 truncate" title={file.alt}>
                    Alt: {file.alt}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteFile}
        title="Delete File"
        message={`Are you sure you want to delete "${confirmDeleteFile?.filename}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteFile(null)}
      />
    </div>
  );
}
