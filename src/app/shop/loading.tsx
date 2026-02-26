export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header placeholder */}
      <div className="h-20 border-b border-[var(--border)]" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title skeleton */}
        <div className="h-10 w-48 bg-[var(--overlay)] rounded-lg animate-pulse mb-8" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] overflow-hidden">
              <div className="aspect-square bg-[var(--hover)] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-[var(--hover)] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-[var(--hover)] rounded animate-pulse" />
                <div className="h-6 w-1/3 bg-[var(--hover)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
