/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },

    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://client.crisp.chat https://widget.crisp.chat https://js.stripe.com https://us-assets.i.posthog.com",
              "style-src 'self' 'unsafe-inline' https://client.crisp.chat",
              "img-src 'self' data: blob: https://*.blob.vercel-storage.com https://img.clerk.com https://image.crisp.chat https://client.crisp.chat",
              "font-src 'self' data: https://client.crisp.chat",
              "connect-src 'self' https://*.clerk.com https://*.stripe.com https://client.crisp.chat wss://client.relay.crisp.chat https://api.brevo.com https://us.i.posthog.com https://*.posthog.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://game.crisp.chat",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
