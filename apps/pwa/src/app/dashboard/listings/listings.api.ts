import {
  useSwrHelper,
  useSwrMutationHelper,
} from '@/libs/api/api.hook.use-swr-helper';
import {
  deleteFetcher,
  fetcher,
  patchFetcher,
  postFetcher,
} from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { ListingFormDto, MyListing, MyListingsResponse } from './listings.types';

export function useMyListings() {
  const swr = useSWR<MyListingsResponse>(
    '/real-estate/listings?limit=50',
    fetcher,
  );
  return useSwrHelper(swr);
}

export function useListing(id?: number) {
  const swr = useSWR<MyListing>(
    id != null ? `/real-estate/listings/${id}` : null,
    fetcher,
  );
  return useSwrHelper(swr);
}

export function useCreateListing() {
  const swr = useSWRMutation(
    '/real-estate/listings',
    postFetcher<ListingFormDto, MyListing>,
  );
  return useSwrMutationHelper(swr);
}

export function useUpdateListing(id: number) {
  const swr = useSWRMutation(
    `/real-estate/listings/${id}`,
    patchFetcher<ListingFormDto, MyListing>,
  );
  return useSwrMutationHelper(swr);
}

export function useDeleteListing(id: number) {
  const swr = useSWRMutation(`/real-estate/listings/${id}`, (url: string) =>
    deleteFetcher<{ success: boolean }>(url),
  );
  return useSwrMutationHelper(swr);
}
