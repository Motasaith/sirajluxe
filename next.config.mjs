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
      {
        protocol: "https",
        hostname: "**",
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://client.crisp.chat https://widget.crisp.chat https://js.stripe.com https://us-assets.i.posthog.com https://*.clerk.accounts.dev https://*.clerk.com https://*.tawk.to https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://client.crisp.chat https://embed.tawk.to",
              "img-src 'self' data: blob: https://*.blob.vercel-storage.com https://*.public.blob.vercel-storage.com https://img.clerk.com https://image.crisp.chat https://client.crisp.chat https://*.tawk.to",
              "font-src 'self' data: https://client.crisp.chat",
              "connect-src 'self' https://api.clerk.com https://*.clerk.com https://*.clerk.accounts.dev https://*.stripe.com https://client.crisp.chat wss://client.relay.crisp.chat https://api.resend.com https://us.i.posthog.com https://*.posthog.com https://*.tawk.to wss://*.tawk.to https://clerk-telemetry.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://game.crisp.chat https://challenges.cloudflare.com https://*.tawk.to",
              "worker-src 'self' blob: https://challenges.cloudflare.com",
              "media-src 'self' https://embed.tawk.to https://*.tawk.to"
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
