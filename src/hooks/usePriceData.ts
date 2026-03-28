import { useState, useEffect } from 'react';
import type { PriceData } from '../types';

interface UsePriceDataResult {
  data: PriceData | null;
  loading: boolean;
  error: string | null;
}

export function usePriceData(): UsePriceDataResult {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/card-prices.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json() as Promise<PriceData>;
      })
      .then(setData)
      .catch(() => setError('Data failed to load. Please contact Richard to fix it.'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
