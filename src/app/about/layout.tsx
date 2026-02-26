import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Siraj Luxe",
  description:
    "Discover the story behind Siraj Luxe — your beacon of premium goods. Learn about our mission, values, and commitment to quality.",
  openGraph: {
    title: "About Us | Siraj Luxe",
    description:
      "Discover the story behind Siraj Luxe — your beacon of premium goods.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
