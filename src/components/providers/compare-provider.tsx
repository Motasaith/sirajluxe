"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CompareItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  colors?: string[];
  sizes?: string[];
  inventory: number;
  inStock: boolean;
  description?: string;
}

interface CompareContextType {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearAll: () => void;
  count: number;
}

const CompareContext = createContext<CompareContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInCompare: () => false,
  clearAll: () => {},
  count: 0,
});

export function useCompare() {
  return useContext(CompareContext);
}

const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  const addItem = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isInCompare = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const clearAll = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider
      value={{ items, addItem, removeItem, isInCompare, clearAll, count: items.length }}
    >
      {children}
    </CompareContext.Provider>
  );
}
