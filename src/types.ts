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
  tcgplayer_url: string | null;
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

export type BuyCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';

export const CONDITION_PCTS: Record<BuyCondition, number> = {
  NM: 0.9, LP: 0.7, MP: 0.5, HP: 0.4, DMG: 0.3,
};

export interface BuyItem {
  id: string;
  cardName: string;
  set: string;
  setName: string;
  printing: string;
  foilType: 'non-foil' | 'foil';
  scryfallId: string;
  basePrice: number;
  condition: BuyCondition;
  overridePrice: number | null;
  price: number;
  quantity: number;
}
