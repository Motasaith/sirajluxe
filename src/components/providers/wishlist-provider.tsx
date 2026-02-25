"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";

interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  addedAt: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  itemCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

// localStorage key for guest wishlist (just product IDs)
const GUEST_WISHLIST_KEY = "sirajluxe-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [guestIds, setGuestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist when user signs in
  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist();
    } else {
      // Load guest wishlist IDs from localStorage
      try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
        if (stored) setGuestIds(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [isSignedIn]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = useCallback(
    (productId: string) => {
      if (isSignedIn) {
        return items.some((item) => item.id === productId);
      }
      return guestIds.includes(productId);
    },
    [items, guestIds, isSignedIn]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isSignedIn) {
        // Guest: just toggle in localStorage
        setGuestIds((prev) => {
          const next = prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId];
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
          return next;
        });
        return;
      }

      const inList = isInWishlist(productId);
      // Optimistic update
      if (inList) {
        setItems((prev) => prev.filter((item) => item.id !== productId));
      }

      try {
        if (inList) {
          await fetch("/api/wishlist", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
        } else {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
        }
        // Re-fetch to get full product data
        await fetchWishlist();
      } catch {
        // Revert on error
        await fetchWishlist();
      }
    },
    [isSignedIn, isInWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isSignedIn) {
        setGuestIds((prev) => {
          const next = prev.filter((id) => id !== productId);
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
          return next;
        });
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== productId));
      try {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } catch {
        await fetchWishlist();
      }
    },
    [isSignedIn]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: isSignedIn ? items.length : guestIds.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
