"use client";

import { useState } from "react";
import { Download, Loader2, Database, AlertTriangle } from "lucide-react";

export default function BackupPage() {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBackup = async () => {
        setDownloading(true);
        setError(null);
        try {
            const response = await fetch("/api/admin/backup");

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Backup failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            // Get the filename from the Content-Disposition header if possible, or use a default
            const contentDisposition = response.headers.get("Content-Disposition");
            let filename = `binacodes_backup_${new Date().toISOString().split("T")[0]}.json`;
            if (contentDisposition) {
                const matches = /filename="([^"]+)"/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Database Backup</h1>
                    <p className="text-sm text-gray-500 mt-1">Export your store&apos;s data securely</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Backup Card */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-8 max-w-2xl">
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
                        <Database className="w-8 h-8 text-violet-400" />
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Full JSON Export</h2>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                Download a complete snapshot of your store&apos;s database. This includes products, orders, users, reviews, categories, and settings.
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-sm text-yellow-500/90 leading-relaxed font-medium">
                                Keep this file secure. It contains sensitive customer information and full order histories.
                            </p>
                        </div>

                        <button
                            onClick={handleBackup}
                            disabled={downloading}
                            className="px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50 flex items-center gap-2 mt-4"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating Backup...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download Backup (.json)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
