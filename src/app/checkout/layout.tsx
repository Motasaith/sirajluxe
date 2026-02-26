import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Siraj Luxe",
  description: "Complete your Siraj Luxe purchase securely.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
