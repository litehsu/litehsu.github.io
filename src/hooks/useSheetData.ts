import { useState, useEffect } from 'react';

export interface SheetRow {
  name: string;
  set: string;
  price: string;
}

export type TabName = 'mtg' | 'pokemon' | 'other';

type AllData = Record<TabName, SheetRow[]>;

const TABS: TabName[] = ['mtg', 'pokemon', 'other'];

export function useSheetData() {
  const [data, setData] = useState<AllData>({ mtg: [], pokemon: [], other: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const results = await Promise.all(
          TABS.map(tab => fetch(`/api/sheets/${tab}`).then(r => {
            if (!r.ok) throw new Error(`Failed to load ${tab}`);
            return r.json() as Promise<SheetRow[]>;
          }))
        );
        setData({ mtg: results[0], pokemon: results[1], other: results[2] });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load sheet data');
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
