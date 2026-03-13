"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Store, Globe, Truck, Hash, Share2, Plus, Trash2, Receipt } from "lucide-react";
import { toast } from "../components/toast";

interface ShippingZone {
  name: string;
  countries: string[];
  rate: number;
  minOrderFree: number;
  weightTiers: { maxWeight: number; rate: number }[];
}

interface TaxRule {
  country: string;
  rate: number;
  name: string;
}

interface SettingsData {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
  taxRate: number;
  enableStripeTax: boolean;
  taxRules: TaxRule[];
  freeShippingThreshold: number;
  shippingFlatRate: number;
  lowStockThreshold: number;
  orderPrefix: string;
  shippingZones: ShippingZone[];
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
  enableStripeTax: false,
  taxRules: [],
  freeShippingThreshold: 10,
  shippingFlatRate: 4.99,
  lowStockThreshold: 5,
  orderPrefix: "SL",
  shippingZones: [],
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
          enableStripeTax: data.enableStripeTax ?? false,
          freeShippingThreshold: data.freeShippingThreshold ?? 10,
          shippingFlatRate: data.shippingFlatRate ?? 4.99,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          orderPrefix: data.orderPrefix || "SL",
          shippingZones: data.shippingZones?.map((z: ShippingZone) => ({ ...z, weightTiers: z.weightTiers || [] })) || [],
          taxRules: data.taxRules || [],
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
              <label className="block text-xs text-gray-500 mb-1.5">Fallback Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.taxRate}
                onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
              <p className="text-[10px] text-gray-600 mt-1">Used when Stripe Tax is disabled.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div>
              <label className="text-sm text-gray-300 font-medium">Enable Stripe Tax</label>
              <p className="text-[10px] text-gray-600 mt-0.5">Automatically calculate location-based tax on checkout. Requires Stripe Tax to be enabled in your Stripe Dashboard.</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, enableStripeTax: !prev.enableStripeTax }))}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${settings.enableStripeTax ? "bg-violet-600" : "bg-gray-700"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.enableStripeTax ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        </section>

        {/* Tax Rules */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-violet-400" />
              Tax Rules by Country
            </h2>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({
                ...prev,
                taxRules: [...prev.taxRules, { country: "", rate: 0, name: "" }],
              }))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rule
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mb-3">Override the fallback tax rate for specific countries. When Stripe Tax is enabled, these are ignored.</p>
          {settings.taxRules.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No tax rules configured. Using fallback rate above.</p>
          ) : (
            <div className="space-y-3">
              {settings.taxRules.map((rule, i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Country Code</label>
                      <input
                        type="text"
                        value={rule.country}
                        onChange={(e) => setSettings((prev) => {
                          const rules = [...prev.taxRules];
                          rules[i] = { ...rules[i], country: e.target.value.toUpperCase().slice(0, 2) };
                          return { ...prev, taxRules: rules };
                        })}
                        className={inputClass}
                        placeholder="e.g. GB"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={rule.rate}
                        onChange={(e) => setSettings((prev) => {
                          const rules = [...prev.taxRules];
                          rules[i] = { ...rules[i], rate: parseFloat(e.target.value) || 0 };
                          return { ...prev, taxRules: rules };
                        })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Label</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => setSettings((prev) => {
                          const rules = [...prev.taxRules];
                          rules[i] = { ...rules[i], name: e.target.value };
                          return { ...prev, taxRules: rules };
                        })}
                        className={inputClass}
                        placeholder="e.g. UK VAT"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, taxRules: prev.taxRules.filter((_, j) => j !== i) }))}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove Rule
                  </button>
                </div>
              ))}
            </div>
          )}
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

          {/* Shipping Zones */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400">Shipping Zones <span className="text-gray-600">(optional — override flat rate by country)</span></p>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({
                  ...prev,
                  shippingZones: [...prev.shippingZones, { name: "New Zone", countries: [], rate: 0, minOrderFree: 0, weightTiers: [] }],
                }))}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Zone
              </button>
            </div>
            {settings.shippingZones.length === 0 ? (
              <p className="text-xs text-gray-600 italic">No zones configured. Using flat rate above.</p>
            ) : (
              <div className="space-y-3">
                {settings.shippingZones.map((zone, i) => (
                  <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Zone Name</label>
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => setSettings((prev) => {
                            const zones = [...prev.shippingZones];
                            zones[i] = { ...zones[i], name: e.target.value };
                            return { ...prev, shippingZones: zones };
                          })}
                          className={inputClass}
                          placeholder="e.g. Europe"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Rate (£)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={zone.rate}
                          onChange={(e) => setSettings((prev) => {
                            const zones = [...prev.shippingZones];
                            zones[i] = { ...zones[i], rate: parseFloat(e.target.value) || 0 };
                            return { ...prev, shippingZones: zones };
                          })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Countries <span className="text-gray-600">(comma-separated ISO codes, e.g. FR,DE,IT)</span></label>
                        <input
                          type="text"
                          value={zone.countries.join(",")}
                          onChange={(e) => setSettings((prev) => {
                            const zones = [...prev.shippingZones];
                            zones[i] = { ...zones[i], countries: e.target.value.split(",").map(c => c.trim().toUpperCase()).filter(Boolean) };
                            return { ...prev, shippingZones: zones };
                          })}
                          className={inputClass}
                          placeholder="e.g. FR,DE,IT"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Free Shipping Min Order (£, 0 = never free)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={zone.minOrderFree}
                          onChange={(e) => setSettings((prev) => {
                            const zones = [...prev.shippingZones];
                            zones[i] = { ...zones[i], minOrderFree: parseFloat(e.target.value) || 0 };
                            return { ...prev, shippingZones: zones };
                          })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({
                        ...prev,
                        shippingZones: prev.shippingZones.filter((_, j) => j !== i),
                      }))}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove Zone
                    </button>

                    {/* Weight Tiers */}
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-medium text-gray-500">Weight Tiers <span className="text-gray-600">(optional — override flat zone rate by order weight)</span></p>
                        <button
                          type="button"
                          onClick={() => setSettings((prev) => {
                            const zones = [...prev.shippingZones];
                            zones[i] = { ...zones[i], weightTiers: [...(zones[i].weightTiers || []), { maxWeight: 0, rate: 0 }] };
                            return { ...prev, shippingZones: zones };
                          })}
                          className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          + Add Tier
                        </button>
                      </div>
                      {(zone.weightTiers || []).length === 0 ? (
                        <p className="text-[10px] text-gray-600 italic">No weight tiers. Using flat zone rate.</p>
                      ) : (
                        <div className="space-y-2">
                          {(zone.weightTiers || []).map((tier, ti) => (
                            <div key={ti} className="flex items-center gap-2">
                              <div className="flex-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={tier.maxWeight}
                                  onChange={(e) => setSettings((prev) => {
                                    const zones = [...prev.shippingZones];
                                    const tiers = [...(zones[i].weightTiers || [])];
                                    tiers[ti] = { ...tiers[ti], maxWeight: parseFloat(e.target.value) || 0 };
                                    zones[i] = { ...zones[i], weightTiers: tiers };
                                    return { ...prev, shippingZones: zones };
                                  })}
                                  className={inputClass}
                                  placeholder="Max kg"
                                />
                              </div>
                              <span className="text-[10px] text-gray-500">kg →</span>
                              <div className="flex-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={tier.rate}
                                  onChange={(e) => setSettings((prev) => {
                                    const zones = [...prev.shippingZones];
                                    const tiers = [...(zones[i].weightTiers || [])];
                                    tiers[ti] = { ...tiers[ti], rate: parseFloat(e.target.value) || 0 };
                                    zones[i] = { ...zones[i], weightTiers: tiers };
                                    return { ...prev, shippingZones: zones };
                                  })}
                                  className={inputClass}
                                  placeholder="£ rate"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setSettings((prev) => {
                                  const zones = [...prev.shippingZones];
                                  zones[i] = { ...zones[i], weightTiers: (zones[i].weightTiers || []).filter((_, j) => j !== ti) };
                                  return { ...prev, shippingZones: zones };
                                })}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
