export interface PricePoint {
  timestamp: string;
  jpTopBuyPrice: number;
  jpTopBuyStore?: string;
  richardBuyPrice?: number;
}

export interface ScryfallPrices {
  usd: string | null;
  usd_foil: string | null;
  usd_etched: string | null;
}

export interface Variation {
  set: string;
  setName: string;
  printing: string;
  foilType: string;
  language: string;
}

export interface CardEntry {
  cardName: string;
  scryfallId: string;
  collectorNumber: string;
  variation: Variation;
  priceHistory: PricePoint[];
}

export interface PriceData {
  lastScraped: string;
  cards: CardEntry[];
}
