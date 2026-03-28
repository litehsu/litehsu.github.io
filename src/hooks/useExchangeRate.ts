import { useState, useEffect } from 'react';

export function useExchangeRate(): number | null {
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/JPY')
      .then(r => r.json())
      .then(d => setRate(d.rates?.USD ?? null))
      .catch(() => {});
  }, []);

  return rate;
}
