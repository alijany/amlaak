import {
  fetcher,
  patchFetcher,
  postFetcher,
} from '@/libs/api/api.util.fetcher';
import {
  useSwrHelper,
  useSwrMutationHelper,
} from '@/libs/api/api.hook.use-swr-helper';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateLeadDto,
  GetLeadsResponse,
  Lead,
  LeadFilterDto,
  UpdateLeadDto,
} from './leads.types';

function buildQuery(filters?: LeadFilterDto): string {
  return new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, v]) => v !== undefined && v !== null)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
  ).toString();
}

export function useLeads(filters?: LeadFilterDto) {
  const query = buildQuery(filters);
  return useSwrHelper(
    useSWR<GetLeadsResponse>(`/leads/manage?${query}`, fetcher),
  );
}

export function useCreateLead() {
  return useSwrMutationHelper(
    useSWRMutation('/leads', postFetcher<CreateLeadDto, Lead>),
  );
}

export function useUpdateLead(id: number) {
  return useSwrMutationHelper(
    useSWRMutation(`/leads/${id}`, patchFetcher<UpdateLeadDto, Lead>),
  );
}
