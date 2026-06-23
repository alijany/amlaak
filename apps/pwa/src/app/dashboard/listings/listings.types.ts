import { PublishStatus, RealEstateCategory } from '../crawler/crawler.types';

export { PublishStatus, RealEstateCategory };

export interface MyListing {
  id: number;
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
  city?: string;
  district?: string;
  images?: string[];
  publishStatus?: PublishStatus;
  created_at?: string;
}

export interface MyListingsResponse {
  items: MyListing[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export interface ListingFormDto {
  title: string;
  description?: string;
  category?: RealEstateCategory;
  totalPrice?: number;
  deposit?: number;
  rent?: number;
  pricePerMeter?: number;
  area?: number;
  rooms?: number;
  yearBuilt?: number;
  floor?: number;
  province?: string;
  city?: string;
  district?: string;
  images?: string[];
}
