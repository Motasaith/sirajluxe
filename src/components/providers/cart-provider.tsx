"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  guestEmail: string;
  setGuestEmail: (email: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "sirajluxe-cart";
const CART_SESSION_KEY = "sirajluxe-session";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { isSignedIn } = useUser();
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSynced = useRef<string>("");
  const [guestEmail, setGuestEmail] = useState("");
  const sessionIdRef = useRef<string>("");

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      
      let sid = localStorage.getItem(CART_SESSION_KEY) || "";
      if (!sid) {
        sid = uuidv4();
        localStorage.setItem(CART_SESSION_KEY, sid);
      }
      sessionIdRef.current = sid;
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // On mount or sign-in: merge server cart with local cart
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        const res = await fetch("/api/cart", {
          headers: { "x-session-id": sessionIdRef.current },
        });
        if (!res.ok) return;
        const { items: serverItems } = await res.json();
        if (serverItems && serverItems.length > 0) {
          setItems((local) => {
            if (local.length === 0) return serverItems;
            // Merge: keep local items, add any server-only items
            const localKeys = new Set(
              local.map((i: CartItem) => `${i.id}-${i.color || ""}-${i.size || ""}`)
            );
            const merged = [...local];
            for (const si of serverItems) {
              const key = `${si.productId || si.id}-${si.color || ""}-${si.size || ""}`;
              if (!localKeys.has(key)) {
                merged.push({
                  id: si.productId || si.id,
                  name: si.name,
                  price: si.price,
                  image: si.image || "",
                  quantity: si.quantity,
                  color: si.color,
                  size: si.size,
                });
              }
            }
            return merged;
          });
        }
      } catch {
        // server sync failed — continue with local cart
      }
    })();
  }, [hydrated, isSignedIn]);

  // Save cart to localStorage + debounced server sync
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

    // Debounced server sync (500ms after last change)
    const serialized = JSON.stringify({ items, guestEmail });
    if (serialized === lastSynced.current) return;

    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      lastSynced.current = serialized;
      fetch("/api/cart", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-session-id": sessionIdRef.current 
        },
        body: JSON.stringify({
          email: guestEmail,
          items: items.map((i) => ({
              productId: i.id,
              name: i.name,
              price: i.price,
              image: i.image,
              quantity: i.quantity,
              color: i.color || "",
              size: i.size || "",
            })),
          }),
        }).catch(() => {});
      }, 500);
  }, [items, hydrated, guestEmail]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        // Create unique key: id + color + size
        const cartKey = `${item.id}-${item.color || ""}-${item.size || ""}`;
        const existing = prev.find(
          (i) => `${i.id}-${i.color || ""}-${i.size || ""}` === cartKey
        );
        if (existing) {
          return prev.map((i) =>
            `${i.id}-${i.color || ""}-${i.size || ""}` === cartKey
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((id: string, color?: string, size?: string) => {
    const cartKey = `${id}-${color || ""}-${size || ""}`;
    setItems((prev) => prev.filter((i) => `${i.id}-${i.color || ""}-${i.size || ""}` !== cartKey));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, color?: string, size?: string) => {
    const cartKey = `${id}-${color || ""}-${size || ""}`;
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => `${i.id}-${i.color || ""}-${i.size || ""}` !== cartKey));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (`${i.id}-${i.color || ""}-${i.size || ""}` === cartKey ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    fetch("/api/cart", { 
      method: "DELETE",
      headers: { "x-session-id": sessionIdRef.current }
    }).catch(() => {});
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((v) => !v),
        guestEmail,
        setGuestEmail,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
