"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Store, Globe, Truck, Hash, Share2 } from "lucide-react";
import { toast } from "../components/toast";

interface SettingsData {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  shippingFlatRate: number;
  lowStockThreshold: number;
  orderPrefix: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    facebook: string;
    tiktok: string;
  };
}

const defaultSettings: SettingsData = {
  storeName: "Siraj Luxe",
  storeEmail: "",
  storePhone: "",
  currency: "GBP",
  taxRate: 0,
  freeShippingThreshold: 50,
  shippingFlatRate: 4.99,
  lowStockThreshold: 5,
  orderPrefix: "SL",
  socialLinks: { instagram: "", twitter: "", facebook: "", tiktok: "" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          storeName: data.storeName || defaultSettings.storeName,
          storeEmail: data.storeEmail || "",
          storePhone: data.storePhone || "",
          currency: data.currency || "GBP",
          taxRate: data.taxRate ?? 0,
          freeShippingThreshold: data.freeShippingThreshold ?? 50,
          shippingFlatRate: data.shippingFlatRate ?? 4.99,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          orderPrefix: data.orderPrefix || "SL",
          socialLinks: {
            instagram: data.socialLinks?.instagram || "",
            twitter: data.socialLinks?.twitter || "",
            facebook: data.socialLinks?.facebook || "",
            tiktok: data.socialLinks?.tiktok || "",
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast("Settings saved", "success");
      } else {
        toast("Failed to save settings", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field: keyof SettingsData["socialLinks"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#0d0d12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your store</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      <div className="space-y-6">
        {/* Store Info */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-violet-400" />
            Store Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Contact Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => updateField("storeEmail", e.target.value)}
                placeholder="hello@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => updateField("storePhone", e.target.value)}
                placeholder="+44..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Order Prefix</label>
              <input
                type="text"
                value={settings.orderPrefix}
                onChange={(e) => updateField("orderPrefix", e.target.value.toUpperCase())}
                placeholder="SL"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Regional */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" />
            Regional
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                className={inputClass}
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.taxRate}
                onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-violet-400" />
            Shipping
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Flat Rate (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.shippingFlatRate}
                onChange={(e) => updateField("shippingFlatRate", parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Free Shipping Threshold (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.freeShippingThreshold}
                onChange={(e) => updateField("freeShippingThreshold", parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
              <p className="text-[10px] text-gray-600 mt-1">Orders above this get free shipping. 0 = no free shipping.</p>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-violet-400" />
            Inventory
          </h2>
          <div className="max-w-xs">
            <label className="block text-xs text-gray-500 mb-1.5">Low Stock Threshold</label>
            <input
              type="number"
              min="1"
              value={settings.lowStockThreshold}
              onChange={(e) => updateField("lowStockThreshold", parseInt(e.target.value) || 5)}
              className={inputClass}
            />
            <p className="text-[10px] text-gray-600 mt-1">Products below this quantity show low-stock warnings on the dashboard.</p>
          </div>
        </section>

        {/* Social Links */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-violet-400" />
            Social Links
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Instagram</label>
              <input
                type="url"
                value={settings.socialLinks.instagram}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Twitter / X</label>
              <input
                type="url"
                value={settings.socialLinks.twitter}
                onChange={(e) => updateSocial("twitter", e.target.value)}
                placeholder="https://x.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Facebook</label>
              <input
                type="url"
                value={settings.socialLinks.facebook}
                onChange={(e) => updateSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">TikTok</label>
              <input
                type="url"
                value={settings.socialLinks.tiktok}
                onChange={(e) => updateSocial("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
