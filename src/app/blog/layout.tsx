import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Siraj Luxe",
  description:
    "Style guides, product spotlights, and fashion inspiration from the Siraj Luxe team.",
  openGraph: {
    title: "Blog | Siraj Luxe",
    description:
      "Style guides, product spotlights, and fashion inspiration.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
