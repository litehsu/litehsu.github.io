import { useState, useEffect } from 'react';

// number = actual USD buy price (>= $1)
// undefined (key missing) = not on buylist or price < $1
export type CKFoilPrices = { 'non-foil'?: number; foil?: number };
export type CKPricesMap = Map<string, CKFoilPrices>;

export function useCKPrices(): { prices: CKPricesMap | null; updatedAt: string | null } {
  const [prices, setPrices] = useState<CKPricesMap | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/ck-prices.json')
      .then(r => r.json())
      .then(d => {
        const map: CKPricesMap = new Map(Object.entries(d.prices ?? {}));
        setPrices(map);
        setUpdatedAt(d.updated ?? null);
      })
      .catch(() => {});
  }, []);

  return { prices, updatedAt };
}
