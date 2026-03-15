export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Logo mark as spinner background */}
          <svg
            width={44}
            height={44}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-80"
          >
            <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#ld-bg)" />
            <path
              d="M24.5 20.5c0-1.5 1.2-3 3.5-3 3.2 0 5.5 1.8 5.5 4.2 0 2.8-2.5 3.8-5.2 4.8-3 1.2-5.8 2.5-5.8 6 0 3.5 2.8 5.5 6 5.5 2.5 0 4.2-1 5-2.2"
              stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
            />
            <path d="M37 19v18.5h7" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
            <defs>
              <linearGradient id="ld-bg" x1="0" y1="0" x2="64" y2="64">
                <stop stopColor="#2563eb" /><stop offset="1" stopColor="#6d28d9" />
              </linearGradient>
            </defs>
          </svg>
          {/* Spinner ring around the logo */}
          <div className="absolute inset-[-6px] border-2 border-neon-violet/20 border-t-neon-violet rounded-2xl animate-spin" />
        </div>
        <p className="text-sm text-subtle-fg animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
