import { City } from '@/libs/city/city.types';
import { RealEstateCategory } from '../dashboard/crawler/crawler.types';

export { RealEstateCategory };

/** Public, trimmed listing shape returned by /public/listings. */
export interface PublicListing {
  id: number;
  trackingCode: string;
  title?: string;
  description?: string;
  category: RealEstateCategory;
  totalPrice?: number;
  deposit?: number;
  rent?: number;
  pricePerMeter?: number;
  area?: number;
  rooms?: number;
  yearBuilt?: number;
  floor?: number;
  province?: string;
  city?: City;
  district?: string;
  images?: string[];
  attributes?: Record<string, unknown>;
  publishedAt?: string;
  agency?: { id: number; name: string; slug?: string; phone?: string; isPlatform?: boolean };
}

export interface PublicListingsResponse {
  items: PublicListing[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export interface PublicListingFilters {
  page?: number;
  limit?: number;
  category?: RealEstateCategory;
  citySlug?: string;
  district?: string;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}
