/**
 * Real-estate domain constants. These used to live in the generic crawler
 * engine; they now belong to the domain module that owns advertisements.
 */

/** Real-estate listing category (normalized across sites). */
export enum RealEstateCategory {
  SALE = 'sale',
  RENT = 'rent',
  MORTGAGE = 'mortgage',
  UNKNOWN = 'unknown',
}

/** Stable site keys for the real-estate providers shipped today. */
export const SiteKey = {
  MOCK: 'mock',
  DIVAR: 'divar',
} as const;

export type SiteKeyType = (typeof SiteKey)[keyof typeof SiteKey];
