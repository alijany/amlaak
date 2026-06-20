import { RawCrawlItem } from '../crawler/providers/crawler-provider.interface';
import { RealEstateCategory } from './real-estate.constants';

/**
 * Real-estate fields a provider carries inside {@link RawCrawlItem.data}. This
 * is the provider's best-effort, lightly-structured view of a listing; the
 * {@link NormalizationService} maps it into a {@link RealEstateAdvertisementEntity}.
 */
export interface RealEstateRawFields {
  title?: string;
  description?: string;
  category?: RealEstateCategory;
  /** Free-form fields straight from the source (prices as strings, fa digits, etc.). */
  attributes?: Record<string, unknown>;
  images?: string[];
  postedAt?: string | Date;
  /** Allow extra provider-specific keys; keeps `data` a generic bag for the engine. */
  [key: string]: unknown;
}

/** A raw real-estate item: the engine's {@link RawCrawlItem} with typed `data`. */
export interface RawAdvertisement extends RawCrawlItem {
  data?: RealEstateRawFields;
}

/** Build a {@link RawCrawlItem} from real-estate fields for a provider to emit. */
export function toRawAdvertisement(item: {
  externalId: string;
  sourceUrl?: string;
  fields: RealEstateRawFields;
  raw?: unknown;
}): RawAdvertisement {
  return {
    externalId: item.externalId,
    sourceUrl: item.sourceUrl,
    data: item.fields,
    raw: item.raw,
  };
}
