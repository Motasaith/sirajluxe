import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Siraj Luxe — Beacon of Premium Goods";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo Circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 18c0-2 1.6-4 4.5-4 4 0 7 2.4 7 5.6 0 3.6-3.2 5-6.6 6.2-3.8 1.5-7.4 3.2-7.4 7.8 0 4.5 3.6 7 7.6 7 3.2 0 5.4-1.3 6.4-2.8"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M38 16v24h9"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Siraj Luxe
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 24,
            color: "#a78bfa",
            margin: "0 0 16px 0",
            fontWeight: 500,
          }}
        >
          Beacon of Premium Goods
        </p>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            color: "#9ca3af",
            margin: 0,
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          Premium curated products • Free UK delivery over £10 • Hassle-free returns
        </p>

        {/* Decorative gradient bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
