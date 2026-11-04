import { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'trellis:basket';
export const BASKET_LIMIT = 5;

// TODO (backend): on page load, revalidate basket items against live availability —
// a book may have become reserved/on_loan since the user last visited. Ask how to
// handle stale items (silently remove? show a warning? keep but disable?).

interface BasketContextValue {
  items: string[];
  count: number;
  atLimit: boolean;
  hasItem: (id: string) => boolean;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
}

const BasketContext = createContext<BasketContextValue | null>(null);

function readStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeStorage(items: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>(readStorage);

  const hasItem = (id: string) => items.includes(id);

  const addItem = (id: string) => {
    setItems((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeStorage(next);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i !== id);
      writeStorage(next);
      return next;
    });
  };

  return (
    <BasketContext.Provider value={{ items, count: items.length, atLimit: items.length >= BASKET_LIMIT, hasItem, addItem, removeItem }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used within BasketProvider');
  return ctx;
}
