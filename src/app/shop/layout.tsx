import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products | Siraj Luxe",
  description:
    "Browse our curated collection of premium clothing, accessories, and lifestyle products. Free shipping on your first order over £10.",
  openGraph: {
    title: "Shop All Products | Siraj Luxe",
    description:
      "Browse our curated collection of premium clothing, accessories, and lifestyle products.",
    type: "website",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
