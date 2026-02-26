import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Siraj Luxe — Beacon of Premium Goods",
    short_name: "Siraj Luxe",
    description:
      "Shop premium curated products at Siraj Luxe. UK-based store with fast delivery and hassle-free returns.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
