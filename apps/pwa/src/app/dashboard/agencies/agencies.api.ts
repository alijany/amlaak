import { fetcher } from '@/libs/api/api.util.fetcher';
import { useSwrHelper, useSwrMutationHelper } from '@/libs/api/api.hook.use-swr-helper';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { PendingAgency } from './agencies.types';

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
