import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | Siraj Luxe",
  description: "Track and manage your Siraj Luxe orders.",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
