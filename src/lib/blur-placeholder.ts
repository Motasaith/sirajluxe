export const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1a1a2e" offset="20%" />
      <stop stop-color="#16162a" offset="50%" />
      <stop stop-color="#1a1a2e" offset="80%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1a1a2e" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)">
    <animate attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite" />
  </rect>
</svg>`;

export function toBase64(str: string) {
  return typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);
}

export const blurDataURL = `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`;
