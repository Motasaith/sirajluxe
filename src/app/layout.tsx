import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BinaCodes | Premium E-Commerce — UK",
    template: "%s | BinaCodes",
  },
  description:
    "Shop premium curated products at BinaCodes. UK-based store with fast delivery, free shipping on your first order over £10, and hassle-free returns.",
  keywords: [
    "ecommerce",
    "UK online shop",
    "premium products",
    "free shipping UK",
    "BinaCodes",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://binacodes.com"
  ),
  openGraph: {
    title: "BinaCodes | Premium E-Commerce — UK",
    description:
      "Shop premium curated products. Free shipping on your first order over £10.",
    type: "website",
    locale: "en_GB",
    siteName: "BinaCodes",
  },
  twitter: {
    card: "summary_large_image",
    title: "BinaCodes | Premium E-Commerce — UK",
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
              <PostHogProvider>
                <SmoothScrollProvider>{children}</SmoothScrollProvider>
              </PostHogProvider>
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
