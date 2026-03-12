"use client";

import { Download, Database } from "lucide-react";

const TYPES = ["orders", "products", "customers", "reviews"] as const;
const FORMATS = ["csv", "json"] as const;

export default function AdminExportPage() {
  const triggerExport = (type: string, format: string) => {
    const url = `/api/admin/export?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Data Export</h1>
        <p className="text-sm text-gray-500 mt-1">Download store data as CSV or JSON.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TYPES.map((type) => (
          <div key={type} className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-white capitalize">{type}</h2>
            </div>
            <div className="flex gap-2">
              {FORMATS.map((format) => (
                <button
                  key={format}
                  onClick={() => triggerExport(type, format)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] text-sm text-gray-300 hover:text-white hover:bg-white/[0.03] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
