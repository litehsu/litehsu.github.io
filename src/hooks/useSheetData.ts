import { useState, useEffect } from 'react';

export interface SheetRow {
  name: string;
  set: string;
  price: string;
}

export type TabName = 'mtg' | 'pokemon' | 'other';

type AllData = Record<TabName, SheetRow[]>;

const EMPTY: AllData = { mtg: [], pokemon: [], other: [] };

export function useSheetData() {
  const [data, setData] = useState<AllData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('/data/buy-list.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as AllData;
        setData({
          mtg: json.mtg ?? [],
          pokemon: json.pokemon ?? [],
          other: json.other ?? [],
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}
