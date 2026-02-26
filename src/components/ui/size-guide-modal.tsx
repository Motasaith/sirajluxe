"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";
import { useState } from "react";

const sizeData = {
  tops: {
    headers: ["Size", "UK", "Chest (cm)", "Waist (cm)"],
    rows: [
      ["XS", "6-8", "81-86", "61-66"],
      ["S", "8-10", "86-91", "66-71"],
      ["M", "10-12", "91-97", "71-76"],
      ["L", "12-14", "97-102", "76-81"],
      ["XL", "14-16", "102-107", "81-86"],
      ["XXL", "16-18", "107-112", "86-91"],
    ],
  },
  bottoms: {
    headers: ["Size", "UK", "Waist (cm)", "Hip (cm)", "Inseam (cm)"],
    rows: [
      ["XS", "6-8", "61-66", "86-91", "76"],
      ["S", "8-10", "66-71", "91-97", "78"],
      ["M", "10-12", "71-76", "97-102", "79"],
      ["L", "12-14", "76-81", "102-107", "80"],
      ["XL", "14-16", "81-86", "107-112", "81"],
      ["XXL", "16-18", "86-91", "112-117", "82"],
    ],
  },
  shoes: {
    headers: ["UK", "EU", "US", "Foot Length (cm)"],
    rows: [
      ["3", "36", "5", "22.0"],
      ["4", "37", "6", "22.9"],
      ["5", "38", "7", "23.8"],
      ["6", "39", "8", "24.6"],
      ["7", "40", "9", "25.4"],
      ["8", "41", "10", "26.2"],
      ["9", "42", "11", "27.1"],
      ["10", "43", "12", "27.9"],
    ],
  },
};

type SizeCategory = keyof typeof sizeData;

export function SizeGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SizeCategory>("tops");

  const tabs: { key: SizeCategory; label: string }[] = [
    { key: "tops", label: "Tops" },
    { key: "bottoms", label: "Bottoms" },
    { key: "shoes", label: "Shoes" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[71] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-neon-violet" />
                  <h2 className="text-lg font-bold text-heading">Size Guide</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-[var(--overlay)] transition-colors"
                >
                  <X className="w-5 h-5 text-muted-fg" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6 pt-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      activeTab === tab.key
                        ? "bg-neon-violet text-white"
                        : "text-muted-fg hover:text-heading hover:bg-[var(--overlay)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="px-6 py-4 overflow-auto max-h-[50vh]">
                <table className="w-full">
                  <thead>
                    <tr>
                      {sizeData[activeTab].headers.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider border-b border-[var(--border)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData[activeTab].rows.map((row, i) => (
                      <tr key={i} className="hover:bg-[var(--overlay)] transition-colors">
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-3 py-2.5 text-sm border-b border-[var(--border)] ${
                              j === 0 ? "font-semibold text-heading" : "text-muted-fg"
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 p-3 rounded-xl bg-[var(--overlay)] text-xs text-muted-fg">
                  <p className="font-semibold text-heading mb-1">How to Measure</p>
                  <p>For the best fit, take measurements over underwear. Use a soft tape measure and keep it snug but not tight. If you&apos;re between sizes, we recommend sizing up.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
