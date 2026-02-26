import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | Siraj Luxe",
  description:
    "Your saved items at Siraj Luxe. Come back anytime to add them to your cart.",
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
