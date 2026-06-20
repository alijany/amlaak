import { useSwrHelper } from '@/libs/api/api.hook.use-swr-helper';
import { fetcher } from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import { AdvertisementFilters, AdvertisementsResponse } from '../crawler.types';

export function useAdvertisements(filters?: AdvertisementFilters) {
  const query = new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value?.toString() || '' }),
        {},
      ),
  ).toString();

  const swr = useSWR<AdvertisementsResponse>(
    `/real-estate/advertisements?${query}`,
    fetcher,
  );
  return useSwrHelper(swr);
}
