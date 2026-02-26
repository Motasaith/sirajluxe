export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="h-20 border-b border-[var(--border)]" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-10 w-32 bg-[var(--overlay)] rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] overflow-hidden">
              <div className="aspect-video bg-[var(--hover)] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/4 bg-[var(--hover)] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[var(--hover)] rounded animate-pulse" />
                <div className="h-4 w-full bg-[var(--hover)] rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-[var(--hover)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
