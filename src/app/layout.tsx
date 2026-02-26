import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import { SiteContentProvider } from "@/components/providers/site-content-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { CrispProvider } from "@/components/providers/crisp-provider";

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
    "Shop premium curated products at Siraj Luxe. UK-based store with fast delivery, free shipping on your first order over £10, and hassle-free returns.",
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
      "Shop premium curated products. Free shipping on your first order over £10.",
    type: "website",
    locale: "en_GB",
    siteName: "Siraj Luxe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siraj Luxe — Beacon of Premium Goods",
    description:
      "Shop premium curated products. Free shipping on your first order over £10.",
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
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#0a0a0f",
          colorText: "#e1e2e6",
          colorInputBackground: "#1a1a1f",
          colorInputText: "#e1e2e6",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <CartProvider>
              <WishlistProvider>
                <SiteContentProvider>
                <PostHogProvider>
                  {children}
                  <CrispProvider />
                </PostHogProvider>
                </SiteContentProvider>
              </WishlistProvider>
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
