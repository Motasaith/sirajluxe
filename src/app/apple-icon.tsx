import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const runtime = "edge";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #6d28d9 100%)",
          borderRadius: "36px",
        }}
      >
        <svg
          width="120"
          height="120"
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
    ),
    { ...size }
  );
}
