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
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          borderRadius: "36px",
        }}
      >
        <span
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size }
  );
}
