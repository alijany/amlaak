import { useSwrHelper } from '@/libs/api/api.hook.use-swr-helper';
import { fetcher } from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import { Advertisement } from '../../crawler.types';

export function useAdvertisement(id: number | undefined) {
  const swr = useSWR<Advertisement>(
    id != null ? `/real-estate/advertisements/${id}` : null,
    fetcher,
  );
  return useSwrHelper(swr);
}
