"use client";

import { useCompare } from "@/components/providers/compare-provider";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { X, ArrowLeft, Star, Package } from "lucide-react";
import { blurDataURL } from "@/lib/blur-placeholder";

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();

  const rows: { label: string; key: string; render: (item: typeof items[0]) => React.ReactNode }[] = [
    {
      label: "Image",
      key: "image",
      render: (item) => (
        <Link href={`/shop/${item.slug}`}>
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={120}
              height={160}
              className="w-full h-40 object-contain rounded-xl bg-white/[0.02]"
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
          ) : (
            <div className="w-full h-40 rounded-xl bg-[var(--elevated)] flex items-center justify-center">
              <Package className="w-8 h-8 text-[var(--dim)]" />
            </div>
          )}
        </Link>
      ),
    },
    {
      label: "Name",
      key: "name",
      render: (item) => (
        <Link href={`/shop/${item.slug}`} className="text-heading font-semibold hover:text-neon-violet transition-colors text-sm">
          {item.name}
        </Link>
      ),
    },
    {
      label: "Price",
      key: "price",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-neon-violet">£{item.price.toFixed(2)}</span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-sm text-[var(--dim)] line-through">£{item.originalPrice.toFixed(2)}</span>
          )}
        </div>
      ),
    },
    {
      label: "Rating",
      key: "rating",
      render: (item) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(item.rating) ? "text-amber-400 fill-amber-400" : "text-[var(--dim)]"}`} />
          ))}
          <span className="text-xs text-[var(--muted)] ml-1">{item.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      label: "Category",
      key: "category",
      render: (item) => <span className="text-sm text-body">{item.category}</span>,
    },
    {
      label: "Availability",
      key: "availability",
      render: (item) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          item.inStock
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {item.inStock ? `${item.inventory} in stock` : "Out of stock"}
        </span>
      ),
    },
    {
      label: "Colors",
      key: "colors",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.colors && item.colors.length > 0
            ? item.colors.map((c) => (
                <span key={c} className="px-2 py-0.5 text-xs rounded-full bg-[var(--overlay)] text-body border border-[var(--border)]">
                  {c}
                </span>
              ))
            : <span className="text-xs text-[var(--dim)]">—</span>}
        </div>
      ),
    },
    {
      label: "Sizes",
      key: "sizes",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.sizes && item.sizes.length > 0
            ? item.sizes.map((s) => (
                <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-[var(--overlay)] text-body border border-[var(--border)]">
                  {s}
                </span>
              ))
            : <span className="text-xs text-[var(--dim)]">—</span>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-heading transition-colors mb-3">
                <ArrowLeft className="w-4 h-4" /> Back to Shop
              </Link>
              <h1 className="text-3xl font-display font-bold text-heading">Compare Products</h1>
              <p className="text-[var(--muted)] text-sm mt-1">{items.length} of 4 slots used</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Package className="w-12 h-12 text-[var(--dim)] mx-auto mb-4" />
              <p className="text-heading text-lg font-medium mb-2">No Products to Compare</p>
              <p className="text-[var(--muted)] text-sm mb-6">Add products from the shop page using the compare button.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-violet text-white font-medium hover:bg-blue-500 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider w-28 sticky left-0 bg-[var(--bg)] z-10" />
                    {items.map((item) => (
                      <th key={item.id} className="p-3 min-w-[200px] relative">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-2 right-2 p-1 rounded-lg text-[var(--dim)] hover:text-red-400 hover:bg-red-500/10 transition-colors z-10"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="border-t border-[var(--border)]">
                      <td className="p-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider sticky left-0 bg-[var(--bg)] z-10">
                        {row.label}
                      </td>
                      {items.map((item) => (
                        <td key={item.id} className="p-3 align-top">
                          {row.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
