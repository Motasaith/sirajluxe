"use client";

/* ─── Revenue Bar Chart ─── */
export function RevenueChart({ data }: { data: { month: string; revenue: number; orders: number }[] }) {
  if (!data.length) return <EmptyChart message="No revenue data yet" />;
  
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  
  // Format month labels
  const formatMonth = (ym: string) => {
    const [y, m] = ym.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
  };

  return (
    <div className="h-64 flex items-end gap-2">
      {data.map((d) => {
        const height = (d.revenue / maxRevenue) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-[10px] text-gray-400 font-mono">
              £{d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue.toFixed(0)}
            </span>
            <div className="w-full relative group">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-violet-400 transition-all duration-500 hover:from-blue-500 hover:to-violet-300 min-h-[4px]"
                style={{ height: `${Math.max(height, 2)}%`, maxHeight: "180px" }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10">
                <p className="text-white font-semibold">£{d.revenue.toFixed(2)}</p>
                <p className="text-gray-400">{d.orders} orders</p>
              </div>
            </div>
            <span className="text-[10px] text-gray-500">{formatMonth(d.month)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Orders by Status Donut Chart ─── */
export function StatusDonut({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  
  if (!total) return <EmptyChart message="No orders yet" />;
  
  const colorMap: Record<string, string> = {
    pending: "#6b7280",
    processing: "#f59e0b",
    shipped: "#3b82f6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  // Calculate SVG donut segments
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        {entries.map(([status, count]) => {
          const pct = count / total;
          const dashLength = pct * circumference;
          const dashOffset = -offset;
          offset += dashLength;
          return (
            <circle
              key={status}
              r={radius}
              cx="80"
              cy="80"
              fill="none"
              stroke={colorMap[status] || "#6b7280"}
              strokeWidth="20"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500"
              transform="rotate(-90 80 80)"
            />
          );
        })}
        <text x="80" y="75" textAnchor="middle" className="fill-white text-2xl font-bold">{total}</text>
        <text x="80" y="95" textAnchor="middle" className="fill-gray-500 text-xs">orders</text>
      </svg>
      <div className="space-y-2">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorMap[status] || "#6b7280" }} />
            <span className="text-xs text-gray-400 capitalize">{status}</span>
            <span className="text-xs text-white font-semibold ml-auto">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Top Products ─── */
export function TopProducts({ data }: { data: { name: string; revenue: number; unitsSold: number }[] }) {
  if (!data.length) return <EmptyChart message="No sales data yet" />;
  
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="space-y-3">
      {data.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500 w-5">{i + 1}.</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{p.name}</p>
            <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-400 transition-all duration-500"
                style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-white">£{p.revenue.toFixed(0)}</p>
            <p className="text-[10px] text-gray-500">{p.unitsSold} sold</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
      {message}
    </div>
  );
}
