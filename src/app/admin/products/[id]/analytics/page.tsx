"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { RevenueChart } from "../../../components/charts";

interface ProductAnalytics {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    inventory: number;
    inStock: boolean;
    status: string;
  };
  analytics: {
    totalRevenue: number;
    totalUnitsSold: number;
    totalOrders: number;
    revenueByMonth: { month: string; revenue: number; units: number; orders: number }[];
  };
}

export default function ProductAnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}/analytics`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || "Failed to load analytics");
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <p>{error || "Analytics not found"}</p>
        <Link href="/admin/products" className="text-sm underline mt-4 inline-block">
          Return to Products
        </Link>
      </div>
    );
  }

  const { product, analytics } = data;

  const statCards = [
    { label: "Total Revenue", value: `£${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20" },
    { label: "Units Sold", value: analytics.totalUnitsSold, icon: Package, color: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20" },
    { label: "Orders Included", value: analytics.totalOrders, icon: ShoppingCart, color: "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20" },
    { label: "Conversion Trend", value: "Available soon", icon: TrendingUp, color: "from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/20" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg bg-[#0a0a0f] border border-white/[0.06] text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Performance metrics for this item</p>
        </div>
      </div>

      {/* Product Summary Card */}
      <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/[0.06] flex flex-col md:flex-row gap-6 items-start md:items-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-xl object-cover bg-white/[0.02]"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/[0.05]">
            <Package className="w-8 h-8 text-gray-600" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{product.name}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
            <span className="font-semibold text-violet-400">£{product.price.toFixed(2)}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${
              product.inStock ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {product.inStock ? `${product.inventory || 0} in stock` : "Out of stock"}
            </span>
          </div>
        </div>
        <div>
          <Link
            href={`/admin/products/${product._id}/edit`}
            className="px-4 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-medium border border-white/[0.06] transition-colors"
          >
            Edit Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`p-5 rounded-xl border bg-gradient-to-br ${card.color}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium opacity-80">{card.label}</span>
              <div className="p-2 rounded-lg bg-white/5 backdrop-blur-sm">
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {analytics.revenueByMonth.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue History (6 Months)</h3>
          <div className="h-[300px]">
            <RevenueChart data={analytics.revenueByMonth} />
          </div>
        </div>
      )}
    </div>
  );
}
