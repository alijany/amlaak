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

/** Moderation/distribution state of a listing. */
export enum PublishStatus {
  /** Newly crawled, awaiting manager review. */
  PENDING = 'pending',
  /** Approved — visible on the public site and posted to Telegram. */
  PUBLISHED = 'published',
  /** Reviewed and hidden. */
  REJECTED = 'rejected',
}

/** Where a listing came from. */
export enum AdvertisementSource {
  /** Aggregated from an external site by the crawler. */
  CRAWLER = 'crawler',
  /** Created in-app by a user/agency (marketplace). */
  USER = 'user',
}

/** Stable site keys for the real-estate providers shipped today. */
export const SiteKey = {
  MOCK: 'mock',
  DIVAR: 'divar',
} as const;

export type SiteKeyType = (typeof SiteKey)[keyof typeof SiteKey];
