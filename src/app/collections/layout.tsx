import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | Siraj Luxe",
  description:
    "Explore our curated collections of premium clothing and accessories, hand-picked for style and quality.",
  openGraph: {
    title: "Collections | Siraj Luxe",
    description:
      "Explore our curated collections of premium clothing and accessories.",
    type: "website",
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
