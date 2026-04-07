import { useState, useEffect } from 'react';
import type { BuyItem, BuyCondition } from '../types';
import { CONDITION_PCTS } from '../types';

const STORAGE_KEY = 'hibiki-buy-list';

function calcPrice(basePrice: number, condition: BuyCondition, overridePrice: number | null): number {
  if (overridePrice !== null) return overridePrice;
  return Math.round(basePrice * CONDITION_PCTS[condition] * 100) / 100;
}

function load(): BuyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: BuyItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useBuyList() {
  const [items, setItems] = useState<BuyItem[]>(load);

  useEffect(() => { save(items); }, [items]);

  function addItem(draft: Omit<BuyItem, 'id'>) {
    const item: BuyItem = { ...draft, id: crypto.randomUUID() };
    setItems((prev) => [...prev, item]);
  }

  function updateItem(id: string, patch: { condition?: BuyCondition; quantity?: number; overridePrice?: number | null }) {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const condition = patch.condition ?? item.condition;
      const overridePrice = patch.overridePrice !== undefined ? patch.overridePrice : item.overridePrice;
      const quantity = patch.quantity ?? item.quantity;
      return {
        ...item,
        condition,
        overridePrice,
        quantity,
        price: calcPrice(item.basePrice, condition, overridePrice),
      };
    }));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearAll() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, addItem, updateItem, removeItem, clearAll, total };
}
