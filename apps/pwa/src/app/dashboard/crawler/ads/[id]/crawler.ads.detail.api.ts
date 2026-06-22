import {
  useSwrHelper,
  useSwrMutationHelper,
} from '@/libs/api/api.hook.use-swr-helper';
import { fetcher, patchFetcher } from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Advertisement } from '../../crawler.types';

export function useAdvertisement(id: number | undefined) {
  const swr = useSWR<Advertisement>(
    id != null ? `/real-estate/advertisements/${id}` : null,
    fetcher,
  );
  return useSwrHelper(swr);
}

export function useApproveListing(id: number) {
  const swr = useSWRMutation(
    `/real-estate/advertisements/${id}/publish`,
    patchFetcher<undefined, Advertisement>,
  );
  return useSwrMutationHelper(swr);
}

export function useRejectListing(id: number) {
  const swr = useSWRMutation(
    `/real-estate/advertisements/${id}/reject`,
    patchFetcher<undefined, Advertisement>,
  );
  return useSwrMutationHelper(swr);
}
