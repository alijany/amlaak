import { useSwrHelper } from '@/libs/api/api.hook.use-swr-helper';
import { fetcher } from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import {
  PublicListing,
  PublicListingFilters,
  PublicListingsResponse,
} from './listings.types';

function buildQuery(filters?: PublicListingFilters): string {
  return new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
  ).toString();
}

export function usePublicListings(filters?: PublicListingFilters) {
  const swr = useSWR<PublicListingsResponse>(
    `/public/listings?${buildQuery(filters)}`,
    fetcher,
  );
  return useSwrHelper(swr);
}

export function usePublicListing(id?: number) {
  const swr = useSWR<PublicListing>(
    id != null ? `/public/listings/${id}` : null,
    fetcher,
  );
  return useSwrHelper(swr);
}
