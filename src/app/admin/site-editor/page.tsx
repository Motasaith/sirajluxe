"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layout,
  Home,
  FileText,
} from "lucide-react";
import { ConfirmDialog } from "../components/confirm-dialog";

/* ═══════════════════════════════════════════════════════════
   SECTION CONFIGURATION — defines every editable section
   ═══════════════════════════════════════════════════════════ */

type FieldType = "text" | "textarea" | "url" | "number" | "string-array" | "items";

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  itemFields?: FieldConfig[];
}

interface SectionConfig {
  key: string;
  title: string;
  description: string;
  fields: FieldConfig[];
}

interface GroupConfig {
  group: string;
  icon: typeof Home;
  sections: SectionConfig[];
}

const SECTION_GROUPS: GroupConfig[] = [
  {
    group: "Homepage",
    icon: Home,
    sections: [
      {
        key: "announcement",
        title: "Announcement Bar",
        description: "Promotional banner at the top of every page",
        fields: [
          { key: "text", label: "Announcement Text", type: "text", placeholder: "Free shipping on orders over £50!" },
          { key: "link", label: "Link URL", type: "url", placeholder: "/shop" },
          { key: "linkText", label: "Link Text", type: "text", placeholder: "Shop Now" },
        ],
      },
      {
        key: "homepage.hero",
        title: "Hero Section",
        description: "Main banner area with headline and CTA buttons",
        fields: [
          { key: "badge", label: "Badge Text", type: "text", placeholder: "Spring 2026 Collection" },
          { key: "headline1", label: "Headline Line 1", type: "text", placeholder: "Discover Premium" },
          { key: "headline2", label: "Headline Line 2", type: "text", placeholder: "Products You'll" },
          { key: "headline3", label: "Headline Line 3", type: "text", placeholder: "Love." },
          { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Shop curated collections from top brands. Premium quality, fast delivery..." },
          { key: "ctaPrimaryText", label: "Primary Button Text", type: "text", placeholder: "Shop Now" },
          { key: "ctaPrimaryLink", label: "Primary Button Link", type: "url", placeholder: "/shop" },
          { key: "ctaSecondaryText", label: "Secondary Button Text", type: "text", placeholder: "Browse Collections" },
          { key: "ctaSecondaryLink", label: "Secondary Button Link", type: "url", placeholder: "/collections" },
          { key: "socialProofCount", label: "Social Proof Number", type: "text", placeholder: "50K+" },
          { key: "socialProofText", label: "Social Proof Label", type: "text", placeholder: "5 Star Rating Customers" },
          { key: "trustBadges", label: "Trust Badges", type: "string-array", placeholder: "Premium Quality" },
        ],
      },
      {
        key: "homepage.categories",
        title: "Categories Section",
        description: "Browse-by-category grid",
        fields: [
          { key: "label", label: "Section Label", type: "text", placeholder: "Browse Categories" },
          { key: "heading", label: "Heading", type: "text", placeholder: "Curated collections for the discerning eye." },
        ],
      },
      {
        key: "homepage.products",
        title: "Featured Products Section",
        description: "Trending products grid (products managed in Products tab)",
        fields: [
          { key: "label", label: "Section Label", type: "text", placeholder: "Featured Products" },
          { key: "heading", label: "Heading", type: "text", placeholder: "Trending Now" },
          { key: "buttonText", label: "Button Text", type: "text", placeholder: "View All Products" },
        ],
      },
      {
        key: "homepage.showcase",
        title: "Showcase / Why Us Section",
        description: "Brand story and feature highlights",
        fields: [
          { key: "label", label: "Section Label", type: "text", placeholder: "Why Siraj Luxe" },
          { key: "heading", label: "Heading", type: "textarea", placeholder: "Shopping should feel like an experience, not a transaction." },
          { key: "body", label: "Body Text", type: "textarea", placeholder: "We bridge the gap between digital and physical shopping..." },
          { key: "ctaText", label: "CTA Button Text", type: "text", placeholder: "Our Story" },
          { key: "ctaLink", label: "CTA Button Link", type: "url", placeholder: "/about" },
          {
            key: "features",
            label: "Features",
            type: "items",
            itemFields: [
              { key: "number", label: "Number", type: "text", placeholder: "01" },
              { key: "title", label: "Title", type: "text", placeholder: "3D Product Exploration" },
              { key: "description", label: "Description", type: "textarea", placeholder: "Interact with products in full 3D..." },
            ],
          },
        ],
      },
      {
        key: "homepage.collections",
        title: "Collections Section",
        description: "Featured collections showcase",
        fields: [
          { key: "label", label: "Section Label", type: "text", placeholder: "Featured Collections" },
          { key: "heading", label: "Heading", type: "text", placeholder: "Explore our curated worlds." },
          { key: "buttonText", label: "Button Text", type: "text", placeholder: "All Collections" },
        ],
      },
      {
        key: "homepage.testimonials",
        title: "Testimonials Section",
        description: "Customer testimonials and brand partners marquee",
        fields: [
          { key: "brandsLabel", label: "Brands Label", type: "text", placeholder: "Trusted by industry leaders" },
          { key: "brands", label: "Brand Names", type: "string-array", placeholder: "BRAND NAME" },
          { key: "label", label: "Section Label", type: "text", placeholder: "What people are saying" },
          { key: "heading", label: "Heading", type: "text", placeholder: "Loved by thousands" },
          {
            key: "items",
            label: "Testimonials",
            type: "items",
            itemFields: [
              { key: "text", label: "Quote", type: "textarea", placeholder: "The shopping experience is incredible..." },
              { key: "author", label: "Author Name", type: "text", placeholder: "Sarah Chen" },
              { key: "role", label: "Role / Title", type: "text", placeholder: "Creative Director" },
              { key: "avatar", label: "Avatar Initials", type: "text", placeholder: "SC" },
            ],
          },
        ],
      },
      {
        key: "homepage.cta",
        title: "CTA Section",
        description: "Call-to-action banner at the bottom of homepage",
        fields: [
          { key: "badge", label: "Badge Text", type: "text", placeholder: "Join the movement" },
          { key: "heading", label: "Heading", type: "text", placeholder: "Ready to experience the future of shopping?" },
          { key: "body", label: "Body Text", type: "textarea", placeholder: "Join 50,000+ customers who have already made the switch..." },
          { key: "primaryText", label: "Primary Button Text", type: "text", placeholder: "Start Shopping" },
          { key: "primaryLink", label: "Primary Button Link", type: "url", placeholder: "/shop" },
          { key: "secondaryText", label: "Secondary Button Text", type: "text", placeholder: "Learn More" },
          { key: "secondaryLink", label: "Secondary Button Link", type: "url", placeholder: "/about" },
        ],
      },
    ],
  },
  {
    group: "Layout",
    icon: Layout,
    sections: [
      {
        key: "header",
        title: "Header / Navigation",
        description: "Site logo text and navigation links",
        fields: [
          { key: "logoLetter", label: "Logo Letter (icon)", type: "text", placeholder: "S" },
          { key: "logoText", label: "Logo Text", type: "text", placeholder: "SIRAJ" },
          { key: "logoAccent", label: "Logo Accent", type: "text", placeholder: " LUXE" },
          {
            key: "navLinks",
            label: "Navigation Links",
            type: "items",
            itemFields: [
              { key: "label", label: "Label", type: "text", placeholder: "Home" },
              { key: "href", label: "URL", type: "url", placeholder: "/" },
            ],
          },
        ],
      },
      {
        key: "footer",
        title: "Footer",
        description: "Newsletter, link columns, social media, copyright",
        fields: [
          { key: "newsletterLabel", label: "Newsletter Label", type: "text", placeholder: "Stay in the loop" },
          { key: "newsletterHeading", label: "Newsletter Heading", type: "textarea", placeholder: "Get early access to drops, exclusive offers, and the latest news." },
          { key: "newsletterPlaceholder", label: "Email Placeholder", type: "text", placeholder: "Enter your email" },
          { key: "newsletterButton", label: "Subscribe Button", type: "text", placeholder: "Subscribe" },
          { key: "copyright", label: "Copyright Text", type: "text", placeholder: "© 2026 Siraj Luxe. All rights reserved." },
          { key: "poweredBy", label: "Powered By Text", type: "text", placeholder: "Powered by BinaCodes" },
          {
            key: "socialLinks",
            label: "Social Media Links",
            type: "items",
            itemFields: [
              { key: "platform", label: "Platform Name", type: "text", placeholder: "Twitter" },
              { key: "url", label: "URL", type: "url", placeholder: "https://twitter.com/..." },
            ],
          },
          {
            key: "columns",
            label: "Link Columns",
            type: "items",
            itemFields: [
              { key: "title", label: "Column Title", type: "text", placeholder: "Shop" },
              { key: "linksText", label: "Links (Label|URL, one per line)", type: "textarea", placeholder: "All Products|/shop\nNew Arrivals|/shop?sort=newest" },
            ],
          },
        ],
      },
    ],
  },
  {
    group: "Pages",
    icon: FileText,
    sections: [
      {
        key: "about",
        title: "About Page",
        description: "Company story, stats, values, and team",
        fields: [
          { key: "heroLabel", label: "Hero Label", type: "text", placeholder: "Our Story" },
          { key: "heroHeading", label: "Hero Heading", type: "textarea", placeholder: "We're building the future of how people shop online." },
          { key: "heroBody", label: "Hero Body", type: "textarea", placeholder: "Founded in 2025, Siraj Luxe was born from a simple belief..." },
          {
            key: "stats",
            label: "Stats",
            type: "items",
            itemFields: [
              { key: "value", label: "Value", type: "text", placeholder: "50K+" },
              { key: "label", label: "Label", type: "text", placeholder: "Happy Customers" },
            ],
          },
          {
            key: "values",
            label: "Our Values",
            type: "items",
            itemFields: [
              { key: "title", label: "Title", type: "text", placeholder: "Innovation First" },
              { key: "description", label: "Description", type: "textarea", placeholder: "We constantly push the boundaries..." },
            ],
          },
          {
            key: "team",
            label: "Team Members",
            type: "items",
            itemFields: [
              { key: "name", label: "Name", type: "text", placeholder: "Alex Rivera" },
              { key: "role", label: "Role", type: "text", placeholder: "CEO & Founder" },
              { key: "initials", label: "Initials", type: "text", placeholder: "AR" },
            ],
          },
          { key: "ctaHeading", label: "CTA Heading", type: "text", placeholder: "Want to join the journey?" },
          { key: "ctaBody", label: "CTA Body", type: "textarea", placeholder: "We're always looking for talented people..." },
          { key: "ctaButtonText", label: "CTA Button Text", type: "text", placeholder: "View Open Roles" },
          { key: "ctaButtonLink", label: "CTA Button Link", type: "url", placeholder: "/careers" },
        ],
      },
      {
        key: "contact",
        title: "Contact Page",
        description: "Contact information and details",
        fields: [
          { key: "title", label: "Page Title", type: "text", placeholder: "Contact Us" },
          { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Have a question or need help? We'd love to hear from you." },
          { key: "email", label: "Email Address", type: "text", placeholder: "binacodesecommercestore@gmail.com" },
          { key: "emailDescription", label: "Email Description", type: "text", placeholder: "Send us an email and we'll get back to you." },
          { key: "responseTime", label: "Response Time", type: "text", placeholder: "24 hours" },
          { key: "responseHours", label: "Working Hours", type: "text", placeholder: "Mon–Fri, 9am–5pm GMT" },
        ],
      },
      {
        key: "faq",
        title: "FAQ Page",
        description: "Frequently asked questions",
        fields: [
          { key: "title", label: "Page Title", type: "text", placeholder: "Frequently Asked Questions" },
          { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Can't find what you're looking for? Email us at binacodesecommercestore@gmail.com" },
          {
            key: "items",
            label: "FAQ Items",
            type: "items",
            itemFields: [
              { key: "question", label: "Question", type: "text", placeholder: "What payment methods do you accept?" },
              { key: "answer", label: "Answer", type: "textarea", placeholder: "We accept all major credit cards, Apple Pay, Google Pay..." },
            ],
          },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   ADMIN SITE EDITOR PAGE
   ═══════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = Record<string, any>;

export default function SiteEditorPage() {
  const [activeGroup, setActiveGroup] = useState("Homepage");
  const [allContent, setAllContent] = useState<Record<string, { data: AnyData; enabled: boolean }>>({});
  const [localEdits, setLocalEdits] = useState<Record<string, { data: AnyData; enabled: boolean }>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<string | null>(null);

  // Load all content on mount
  useEffect(() => {
    fetch("/api/admin/site-content")
      .then((r) => r.json())
      .then((res) => {
        const map: Record<string, { data: AnyData; enabled: boolean }> = {};
        for (const s of res.sections || []) {
          map[s.key] = { data: s.data || {}, enabled: s.enabled !== false };
        }
        setAllContent(map);
        setLocalEdits(JSON.parse(JSON.stringify(map)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Get editing data for a section (local edits or DB or empty)
  const getSectionData = (key: string): AnyData => {
    return localEdits[key]?.data || {};
  };

  const isSectionEnabled = (key: string): boolean => {
    return localEdits[key]?.enabled ?? true;
  };

  const updateField = (sectionKey: string, fieldKey: string, value: unknown) => {
    setLocalEdits((prev) => ({
      ...prev,
      [sectionKey]: {
        data: { ...(prev[sectionKey]?.data || {}), [fieldKey]: value },
        enabled: prev[sectionKey]?.enabled ?? true,
      },
    }));
  };

  const toggleEnabled = (sectionKey: string) => {
    setLocalEdits((prev) => ({
      ...prev,
      [sectionKey]: {
        data: prev[sectionKey]?.data || {},
        enabled: !(prev[sectionKey]?.enabled ?? true),
      },
    }));
  };

  const handleSave = async (sectionKey: string) => {
    setSaving(sectionKey);
    setError(null);
    try {
      const edit = localEdits[sectionKey] || { data: {}, enabled: true };
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: sectionKey,
          data: edit.data,
          enabled: edit.enabled,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setAllContent((prev) => ({ ...prev, [sectionKey]: { ...edit } }));
      setSavedKey(sectionKey);
      setTimeout(() => setSavedKey(null), 2000);
    } catch {
      setError(`Failed to save ${sectionKey}`);
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async (sectionKey: string) => {
    setResetTarget(null);
    setSaving(sectionKey);
    try {
      await fetch("/api/admin/site-content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: sectionKey }),
      });
      setAllContent((prev) => {
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });
      setLocalEdits((prev) => {
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });
    } catch {
      setError(`Failed to reset ${sectionKey}`);
    } finally {
      setSaving(null);
    }
  };

  const toggleExpanded = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeGroupConfig = SECTION_GROUPS.find((g) => g.group === activeGroup);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Site Editor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customise every section of your website — toggle visibility, edit text, manage content
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Group Tabs */}
      <div className="flex gap-2 mb-8">
        {SECTION_GROUPS.map((g) => (
          <button
            key={g.group}
            onClick={() => setActiveGroup(g.group)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeGroup === g.group
                ? "bg-violet-600 text-white"
                : "bg-[#111] border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <g.icon className="w-4 h-4" />
            {g.group}
          </button>
        ))}
      </div>

      {/* Section Cards */}
      <div className="space-y-4">
        {activeGroupConfig?.sections.map((section) => {
          const isExpanded = expandedSections[section.key];
          const enabled = isSectionEnabled(section.key);
          const data = getSectionData(section.key);
          const isSaving = saving === section.key;
          const justSaved = savedKey === section.key;
          const hasDBEntry = !!allContent[section.key];

          return (
            <div
              key={section.key}
              className={`bg-[#111] border rounded-xl overflow-hidden transition-colors ${
                enabled ? "border-white/10" : "border-white/5 opacity-60"
              }`}
            >
              {/* Section Header */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => toggleExpanded(section.key)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white text-sm">
                      {section.title}
                    </h3>
                    {hasDBEntry && (
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-semibold border border-violet-500/20">
                        Customised
                      </span>
                    )}
                    {justSaved && (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {section.description}
                  </p>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEnabled(section.key);
                  }}
                  className={`flex-shrink-0 transition-colors ${
                    enabled ? "text-emerald-400" : "text-gray-600"
                  }`}
                  title={enabled ? "Section visible" : "Section hidden"}
                >
                  {enabled ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>

                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Expanded Form */}
              {isExpanded && (
                <div className="border-t border-white/5 p-5 space-y-5">
                  {section.fields.map((field) => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      value={data[field.key]}
                      onChange={(val) =>
                        updateField(section.key, field.key, val)
                      }
                    />
                  ))}

                  {/* Save / Reset buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleSave(section.key)}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                    {hasDBEntry && (
                      <button
                        onClick={() => setResetTarget(section.key)}
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-400 text-sm rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={!!resetTarget}
        title="Reset Section"
        message="Reset this section to defaults? All custom content will be removed."
        confirmLabel="Reset"
        variant="warning"
        onConfirm={() => {
          if (resetTarget) handleReset(resetTarget);
        }}
        onCancel={() => setResetTarget(null)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FIELD RENDERER — renders each field type
   ═══════════════════════════════════════════════════════════ */

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  switch (field.type) {
    case "text":
    case "url":
    case "number":
      return (
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1.5">
            {field.label}
          </label>
          <input
            type={field.type === "number" ? "number" : "text"}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500"
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1.5">
            {field.label}
          </label>
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500 resize-none"
          />
        </div>
      );

    case "string-array":
      return (
        <StringArrayEditor
          label={field.label}
          value={(value as string[]) || []}
          onChange={onChange}
          placeholder={field.placeholder || ""}
        />
      );

    case "items":
      return (
        <ItemsEditor
          label={field.label}
          fields={field.itemFields || []}
          value={(value as AnyData[]) || []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   STRING ARRAY EDITOR — for arrays of strings
   ═══════════════════════════════════════════════════════════ */

function StringArrayEditor({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
}) {
  const addItem = () => onChange([...value, ""]);
  const removeItem = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const updateItem = (idx: number, text: string) => {
    const next = [...value];
    next[idx] = text;
    onChange(next);
  };

  return (
    <div>
      <label className="text-xs font-medium text-gray-400 block mb-1.5">
        {label}
      </label>
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={() => removeItem(idx)}
              className="p-2 text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addItem}
        className="mt-2 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add Item
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ITEMS EDITOR — for arrays of objects
   ═══════════════════════════════════════════════════════════ */

function ItemsEditor({
  label,
  fields,
  value,
  onChange,
}: {
  label: string;
  fields: FieldConfig[];
  value: AnyData[];
  onChange: (val: AnyData[]) => void;
}) {
  const addItem = () => {
    const empty: AnyData = {};
    for (const f of fields) empty[f.key] = "";
    onChange([...value, empty]);
  };

  const removeItem = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const updateItem = (idx: number, fieldKey: string, fieldValue: string) => {
    const next = [...value];
    next[idx] = { ...next[idx], [fieldKey]: fieldValue };
    onChange(next);
  };

  return (
    <div>
      <label className="text-xs font-medium text-gray-400 block mb-2">
        {label}
      </label>
      <div className="space-y-3">
        {value.map((item, idx) => (
          <div
            key={idx}
            className="bg-black/30 border border-white/5 rounded-lg p-4 space-y-3 relative"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Item {idx + 1}
              </span>
              <button
                onClick={() => removeItem(idx)}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-[10px] text-gray-500 block mb-1">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={item[field.key] || ""}
                    onChange={(e) => updateItem(idx, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-violet-500 resize-none"
                  />
                ) : (
                  <input
                    value={item[field.key] || ""}
                    onChange={(e) => updateItem(idx, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-violet-500"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={addItem}
        className="mt-2 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add {label.replace(/s$/, "")}
      </button>
    </div>
  );
}
