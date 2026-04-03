import { useState, useEffect } from 'react';
import type { ScryfallPrices } from '../types';

export type PriceMap = Map<string, ScryfallPrices>;

interface Priceable {
  scryfallId: string;
  variation: { set: string };
  collectorNumber: string;
}

export function cacheKey(set: string, collectorNumber: string) {
  return `${set.toLowerCase()}-${collectorNumber}`;
}

function uniquePairs(entries: Priceable[]): { scryfallId: string; set: string; collectorNumber: string }[] {
  const seen = new Set<string>();
  return entries.filter(({ variation, collectorNumber }) => {
    const key = cacheKey(variation.set, collectorNumber);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(({ scryfallId, variation, collectorNumber }) => ({ scryfallId, set: variation.set, collectorNumber }));
}

export function useScryfallPrices(entries: Priceable[]): PriceMap {
  const [prices, setPrices] = useState<PriceMap>(new Map());

  useEffect(() => {
    if (entries.length === 0) {
      setPrices(new Map());
      return;
    }

    let cancelled = false;
    setPrices(new Map());
    const pairs = uniquePairs(entries);

    async function fetchAll() {
      for (const { scryfallId, set, collectorNumber } of pairs) {
        if (cancelled) break;
        try {
          const url = scryfallId
            ? `https://api.scryfall.com/cards/${scryfallId}`
            : `https://api.scryfall.com/cards/${set.toLowerCase()}/${collectorNumber}`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          const key = cacheKey(set, collectorNumber);
          setPrices((prev) => new Map(prev).set(key, {
            usd: data.prices?.usd ?? null,
            usd_foil: data.prices?.usd_foil ?? null,
            usd_etched: data.prices?.usd_etched ?? null,
            tcgplayer_url: data.purchase_uris?.tcgplayer ?? null,
          }));
        } catch {
          // skip on error, leave cell empty
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [entries]);

  return prices;
}
