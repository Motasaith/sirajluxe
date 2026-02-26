export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-neon-violet/30 border-t-neon-violet rounded-full animate-spin" />
        <p className="text-sm text-subtle-fg animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
