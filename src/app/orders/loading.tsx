export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="h-20 border-b border-[var(--border)]" />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="h-10 w-40 bg-[var(--overlay)] rounded-lg animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-[var(--hover)] rounded animate-pulse" />
                <div className="h-6 w-20 bg-[var(--hover)] rounded-full animate-pulse" />
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-[var(--hover)] rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-[var(--hover)] rounded animate-pulse" />
                  <div className="h-4 w-24 bg-[var(--hover)] rounded animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-[var(--hover)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
