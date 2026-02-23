import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | BinaCodes",
  description: "Manage your store with the BinaCodes glassmorphism admin panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
