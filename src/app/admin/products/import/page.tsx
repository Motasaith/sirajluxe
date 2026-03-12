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

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

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
              setError("");
            }}
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Import Products
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
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
