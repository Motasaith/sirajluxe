"use client";

/**
 * Siraj Luxe Logo — premium monogram mark.
 * A stylised "SL" ligature inside a rounded gemstone/shield shape
 * with a violet → purple gradient. Fully inline SVG — no external assets.
 */
export function LogoMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Siraj Luxe logo"
    >
      <defs>
        <linearGradient id="sl-bg" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#2563eb" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="sl-shine" x1="12" y1="4" x2="52" y2="28">
          <stop stopColor="rgba(255,255,255,0.25)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Rounded shield / gem shape */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#sl-bg)"
      />

      {/* Subtle top-left shine */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#sl-shine)"
      />

      {/* "S" letter — elegant, offset left-centre */}
      <path
        d="M24.5 20.5c0-1.5 1.2-3 3.5-3 3.2 0 5.5 1.8 5.5 4.2 0 2.8-2.5 3.8-5.2 4.8-3 1.2-5.8 2.5-5.8 6 0 3.5 2.8 5.5 6 5.5 2.5 0 4.2-1 5-2.2"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* "L" letter — clean, offset right */}
      <path
        d="M37 19v18.5h7"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small diamond accent — bottom right */}
      <path
        d="M49 46l2.5-3 2.5 3-2.5 3z"
        fill="rgba(255,255,255,0.5)"
      />
    </svg>
  );
}

/**
 * Full brand logo: mark + wordmark.
 * Use `variant="full"` for mark+text or `variant="mark"` for icon only.
 */
export function Logo({
  size = 40,
  variant = "full",
  className = "",
  textClassName = "",
}: {
  size?: number;
  variant?: "full" | "mark";
  className?: string;
  textClassName?: string;
}) {
  if (variant === "mark") {
    return <LogoMark size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span
        className={`font-semibold tracking-tight text-heading ${textClassName}`}
        style={{ fontSize: size * 0.5 }}
      >
        SIRAJ<span className="neon-text"> LUXE</span>
      </span>
    </div>
  );
}
