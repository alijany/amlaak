import {
  useSwrHelper,
  useSwrMutationHelper,
} from '@/libs/api/api.hook.use-swr-helper';
import {
  fetcher,
  patchFetcher,
  postFetcher,
} from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateLeadDto,
  CreateLeadPoolDto,
  Lead,
  LeadFilters,
  LeadPool,
  LeadStats,
  LeadsResponse,
  UpdateLeadDto,
} from './leads.types';

function buildQuery(filters?: LeadFilters): string {
  return new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
  ).toString();
}

export function useLeads(filters?: LeadFilters) {
  const swr = useSWR<LeadsResponse>(`/leads?${buildQuery(filters)}`, fetcher);
  return useSwrHelper(swr);
}

export function useLead(id?: number) {
  const swr = useSWR<Lead>(id != null ? `/leads/${id}` : null, fetcher);
  return useSwrHelper(swr);
}

export function useLeadStats() {
  const swr = useSWR<LeadStats>('/leads/stats', fetcher);
  return useSwrHelper(swr);
}

export function useLeadPools() {
  const swr = useSWR<{ items: LeadPool[] }>('/leads/pools', fetcher);
  return useSwrHelper(swr);
}

export function useCreateLead() {
  const swr = useSWRMutation('/leads', postFetcher<CreateLeadDto, Lead>);
  return useSwrMutationHelper(swr);
}

export function useUpdateLead(id: number) {
  const swr = useSWRMutation(`/leads/${id}`, patchFetcher<UpdateLeadDto, Lead>);
  return useSwrMutationHelper(swr);
}

export function useAssignLead(id: number) {
  const swr = useSWRMutation(
    `/leads/${id}/assign`,
    postFetcher<{ agentId: number }, Lead>,
  );
  return useSwrMutationHelper(swr);
}

export function useClaimLead(id: number) {
  const swr = useSWRMutation(`/leads/${id}/claim`, postFetcher<undefined, Lead>);
  return useSwrMutationHelper(swr);
}

export function useCreateLeadPool() {
  const swr = useSWRMutation(
    '/leads/pools',
    postFetcher<CreateLeadPoolDto, LeadPool>,
  );
  return useSwrMutationHelper(swr);
}
