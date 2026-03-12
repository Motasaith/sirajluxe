"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, Download, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const CSV_TEMPLATE = `name,slug,description,price,originalPrice,category,tags,inStock,featured,image,images,colors,sizes,sku,inventory,metaTitle,metaDescription
"Classic T-Shirt","classic-t-shirt","A comfortable cotton t-shirt",29.99,39.99,"T-Shirts","casual|cotton",true,false,"","","Black|White|Navy","S|M|L|XL","TSH-001",100,"Classic T-Shirt | Siraj Luxe","Premium cotton classic t-shirt"`;

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    updated: number;
    errors: string[];
  } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<{
    summary: {
      total: number;
      valid: number;
      invalid: number;
      wouldCreate: number;
      wouldUpdate: number;
    };
    rows: {
      row: number;
      name: string;
      sku: string;
      price: number;
      category: string;
      inventory: number;
      action: "create" | "update";
      valid: boolean;
      error: string;
    }[];
    truncated?: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = async () => {
    if (!file) return;
    setPreviewing(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "preview");

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Preview failed");
      } else {
        setPreview(data);
      }
    } catch {
      setError("Preview failed. Please try again.");
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "import");

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Import Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a CSV file to bulk-create or update products
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">CSV Format</h2>
        <ul className="text-sm text-gray-400 space-y-1.5">
          <li>
            <strong className="text-gray-300">Required columns:</strong> name, price, category
          </li>
          <li>
            <strong className="text-gray-300">Optional columns:</strong> slug, description,
            originalPrice, tags, inStock, featured, image, images, colors, sizes, sku,
            inventory, metaTitle, metaDescription
          </li>
          <li>
            <strong className="text-gray-300">Multi-value fields</strong> (tags, images,
            colors, sizes): separate with <code className="text-violet-400">|</code> pipes
          </li>
          <li>
            <strong className="text-gray-300">Update existing:</strong> if a product with the
            same SKU exists, it will be updated
          </li>
          <li>
            <strong className="text-gray-300">Limits:</strong> max 500 rows, max 5MB file size
          </li>
        </ul>
        <button
          onClick={downloadTemplate}
          className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </button>
      </div>

      {/* Upload */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/[0.08] rounded-lg p-8 text-center cursor-pointer hover:border-violet-500/30 transition-colors"
        >
          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {file ? (
              <span className="text-white">{file.name}</span>
            ) : (
              "Click to select a CSV file"
            )}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setResult(null);
              setPreview(null);
              setError("");
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handlePreview}
            disabled={!file || previewing || importing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/[0.08] text-gray-300 text-sm font-medium hover:bg-white/[0.03] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {previewing ? "Previewing…" : "Preview CSV"}
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing || !preview || preview.summary.invalid > 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Confirm Import
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Validation Preview</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-white">{preview.summary.total}</p>
              <p className="text-xs text-gray-400">Rows</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{preview.summary.valid}</p>
              <p className="text-xs text-gray-400">Valid</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-400">{preview.summary.invalid}</p>
              <p className="text-xs text-gray-400">Invalid</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-400">{preview.summary.wouldCreate}</p>
              <p className="text-xs text-gray-400">Would Create</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-amber-400">{preview.summary.wouldUpdate}</p>
              <p className="text-xs text-gray-400">Would Update</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full min-w-[700px]">
              <thead className="bg-white/[0.02] border-b border-white/[0.06]">
                <tr>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">Row</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">Name</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">SKU</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">Price</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">Category</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">Action</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.row} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-3 py-2 text-xs text-gray-400">{row.row}</td>
                    <td className="px-3 py-2 text-xs text-white">{row.name || "-"}</td>
                    <td className="px-3 py-2 text-xs text-gray-300">{row.sku || "-"}</td>
                    <td className="px-3 py-2 text-xs text-gray-300">£{row.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-gray-300">{row.category || "-"}</td>
                    <td className="px-3 py-2 text-xs capitalize text-gray-300">{row.action}</td>
                    <td className={`px-3 py-2 text-xs ${row.valid ? "text-emerald-400" : "text-red-400"}`}>
                      {row.valid ? "Valid" : row.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.truncated && (
            <p className="text-xs text-gray-500 mt-2">Showing first 200 rows in preview.</p>
          )}
          {preview.summary.invalid > 0 && (
            <p className="text-xs text-red-400 mt-3">Fix invalid rows before confirming import.</p>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Import Complete</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{result.created}</p>
              <p className="text-xs text-gray-400">Created</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{result.updated}</p>
              <p className="text-xs text-gray-400">Updated</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{result.errors.length}</p>
              <p className="text-xs text-gray-400">Errors</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-red-400 mb-2">Errors:</p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-300/70 mb-1">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
