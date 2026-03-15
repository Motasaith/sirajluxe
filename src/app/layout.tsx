import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import { CompareProvider } from "@/components/providers/compare-provider";
import { SiteContentProvider } from "@/components/providers/site-content-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { TawkProvider } from "@/components/providers/tawk-provider";
import { CsrfProvider } from "@/components/providers/csrf-provider";
import { ToastProvider } from "@/components/ui/toast";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { CompareBar } from "@/components/ui/compare-bar";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Siraj Luxe — Beacon of Premium Goods",
    template: "%s | Siraj Luxe",
  },
  description:
    "Shop premium curated products at Siraj Luxe. UK-based store with fast delivery, free shipping on your first order, and hassle-free returns.",
  keywords: [
    "ecommerce",
    "UK online shop",
    "premium products",
    "free shipping UK",
    "Siraj Luxe",
    "luxury UK store",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com"
  ),
  openGraph: {
    title: "Siraj Luxe — Beacon of Premium Goods",
    description:
      "Shop premium curated products. Free shipping on your first order.",
    type: "website",
    locale: "en_GB",
    siteName: "Siraj Luxe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siraj Luxe — Beacon of Premium Goods",
    description:
      "Shop premium curated products. Free shipping on your first order.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorText: "#1a1a1f",
          colorInputBackground: "#f0f0f2",
          colorInputText: "#1a1a1f",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <CsrfProvider>
            <CartProvider>
              <WishlistProvider>
              <CompareProvider>
                <SiteContentProvider>
                <PostHogProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                  <TawkProvider />
                  <CookieConsent />
                  <CompareBar />
                  <Analytics />
                </PostHogProvider>
                </SiteContentProvider>
              </CompareProvider>
              </WishlistProvider>
            </CartProvider>
            </CsrfProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
