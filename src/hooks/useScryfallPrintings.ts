import { useState, useEffect } from 'react';

export interface ScryfallPrinting {
  scryfallId: string;
  set: string;
  setName: string;
  collectorNumber: string;
  printingLabel: string;
  finishes: string[];
  // shape matches Priceable in useScryfallPrices
  variation: { set: string };
}

function derivePrintingLabel(card: Record<string, unknown>): string {
  const frameEffects = (card.frame_effects as string[] | undefined) ?? [];
  const promoTypes = (card.promo_types as string[] | undefined) ?? [];
  const borderColor = card.border_color as string | undefined;

  if (frameEffects.includes('showcase')) return 'Showcase';
  if (frameEffects.includes('extendedart')) return 'Extended Art';
  if (borderColor === 'borderless' || frameEffects.includes('inverted')) return 'Borderless';
  if (promoTypes.includes('bundle')) return 'Bundle Promo';
  if (promoTypes.length > 0) return 'Promo';
  if (card.full_art) return 'Full Art';
  return 'Regular';
}

export function useScryfallPrintings(
  cardName: string | null,
  skip: boolean
): { printings: ScryfallPrinting[]; loading: boolean } {
  const [printings, setPrintings] = useState<ScryfallPrinting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cardName || skip) {
      setPrintings([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setPrintings([]);

    const query = encodeURIComponent(`!"${cardName}" lang:en`);
    fetch(`https://api.scryfall.com/cards/search?q=${query}&unique=prints&order=released`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const cards: ScryfallPrinting[] = (data.data ?? []).map((c: Record<string, unknown>) => {
          const set = (c.set as string).toUpperCase();
          return {
            scryfallId: c.id as string,
            set,
            setName: c.set_name as string,
            collectorNumber: c.collector_number as string,
            printingLabel: derivePrintingLabel(c),
            finishes: (c.finishes as string[]) ?? [],
            variation: { set },
          };
        });
        setPrintings(cards);
      })
      .catch(() => setPrintings([]))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [cardName, skip]);

  return { printings, loading };
}
