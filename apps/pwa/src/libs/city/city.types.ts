/** A curated city, served by the backend /cities lookup endpoint. */
export interface City {
  id: number;
  slug: string;
  nameFa: string;
  nameEn?: string;
}

export interface CitiesResponse {
  items: City[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export interface CityFilters {
  q?: string;
  page?: number;
  limit?: number;
}
