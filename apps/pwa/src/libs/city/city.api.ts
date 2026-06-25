import { useSwrHelper } from '@/libs/api/api.hook.use-swr-helper';
import { fetcher } from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import { CitiesResponse, CityFilters } from './city.types';

function buildQuery(filters?: CityFilters): string {
  return new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
  ).toString();
}

/** Public list of active cities (search + paginate). */
export function useCities(filters?: CityFilters) {
  const swr = useSWR<CitiesResponse>(
    `/cities?${buildQuery(filters)}`,
    fetcher,
  );
  return useSwrHelper(swr);
}
