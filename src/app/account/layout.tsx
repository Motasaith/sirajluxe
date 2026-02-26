import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Siraj Luxe",
  description:
    "Manage your Siraj Luxe account, orders, and preferences.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
