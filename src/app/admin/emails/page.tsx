"use client";

import { useState } from "react";
import { Send, Eye, RefreshCw, Layers } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const templates = [
  { id: "welcomeEmail", label: "Welcome Email" },
  { id: "orderConfirmation", label: "Order Confirmation" },
  { id: "orderShipped", label: "Order Shipped" },
  { id: "trackingUpdate", label: "Tracking Update" },
  { id: "orderDelivered", label: "Order Delivered" },
  { id: "orderCancelled", label: "Order Cancelled" },
  { id: "returnRequest", label: "Return Request" },
  { id: "returnApproved", label: "Return Approved" },
  { id: "returnDenied", label: "Return Denied" },
  { id: "abandonedCart", label: "Abandoned Cart" },
  { id: "adminMessage", label: "Admin Message" },
  { id: "lowStock", label: "Low Stock Alert" },
];

export default function AdminEmailsPage() {
  const [active, setActive] = useState(templates[0].id);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // to reload iframe if needed
  const { toast } = useToast();

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: active, email: testEmail }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }

      toast({
        title: "Test Email Sent",
        description: `Successfully dispatched to ${testEmail}`,
        variant: "success",
      });
    } catch (error: unknown) {
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Email Templates
          </h1>
          <p className="text-gray-400 text-sm">
            Preview HTML email templates and send test messages to verify appearance across clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Selector */}
        <div className="col-span-1 space-y-4">
          <div className="bg-[#111118] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
              <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Templates
              </h2>
            </div>
            <div className="p-2 space-y-1">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setActive(tpl.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active === tpl.id
                      ? "bg-violet-500/10 text-violet-400"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          {/* Action Bar */}
          <div className="bg-[#111118] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">
                Live Preview: <span className="text-white">{templates.find(t => t.id === active)?.label}</span>
              </span>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-md transition-colors"
                title="Refresh Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSendTest} className="flex flex-1 sm:max-w-md w-full gap-2">
              <input
                type="email"
                placeholder="Enter email to receive test"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {sending ? "Sending..." : "Send Test"}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Iframe */}
          <div className="bg-[#111118] border border-white/[0.06] rounded-xl overflow-hidden h-[700px] flex items-center justify-center">
            <iframe
              key={refreshKey}
              src={`/api/admin/emails/preview?type=${active}`}
              className="w-full h-full bg-white transition-opacity duration-300"
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
