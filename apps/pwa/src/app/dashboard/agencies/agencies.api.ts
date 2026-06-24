import { fetcher } from '@/libs/api/api.util.fetcher';
import { useSwrHelper, useSwrMutationHelper } from '@/libs/api/api.hook.use-swr-helper';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { AgenciesListResponse, AgencyFilterDto, PendingAgency } from './agencies.types';

export function useAgencies(filters?: AgencyFilterDto) {
  const query = new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value?.toString() || '' }),
        {},
      ),
  ).toString();

  const swr = useSWR<AgenciesListResponse>(`/agencies?${query}`, fetcher);
  return useSwrHelper(swr);
}

export function usePendingAgencies() {
  const swr = useSWR<{ items: PendingAgency[] }>('/agencies/pending', fetcher);
  return useSwrHelper(swr);
}

export function useConfirmAgency() {
  const swr = useSWRMutation(
    '/agencies',
    (_url: string, { arg }: { arg: number }) =>
      fetcher<PendingAgency>(`/agencies/${arg}/confirm`, { method: 'PATCH' }),
  );
  return useSwrMutationHelper(swr);
}

export function useRejectAgency() {
  const swr = useSWRMutation(
    '/agencies/reject',
    (_url: string, { arg }: { arg: number }) =>
      fetcher<PendingAgency>(`/agencies/${arg}/reject`, { method: 'PATCH' }),
  );
  return useSwrMutationHelper(swr);
}

/** Re-activate a deactivated agency via PATCH /agencies/:id (isActive: true). */
export function useReactivateAgency() {
  const swr = useSWRMutation(
    '/agencies/reactivate',
    (_url: string, { arg }: { arg: number }) =>
      fetcher<PendingAgency>(`/agencies/${arg}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
        headers: { 'Content-Type': 'application/json' },
      }),
  );
  return useSwrMutationHelper(swr);
}
