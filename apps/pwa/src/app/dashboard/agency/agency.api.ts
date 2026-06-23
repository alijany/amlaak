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
import {
  Agency,
  AgencyMember,
  InviteAgencyMemberDto,
  UpdateAgencyDto,
} from './agency.types';

export function useMyAgencies() {
  const swr = useSWR<{ items: Agency[] }>('/agencies/mine', fetcher);
  return useSwrHelper(swr);
}

export function useCreateAgency() {
  const swr = useSWRMutation(
    '/agencies',
    postFetcher<{ name: string; phone?: string; description?: string }, Agency>,
  );
  return useSwrMutationHelper(swr);
}

export function useAgency(id?: number) {
  const swr = useSWR<Agency>(id != null ? `/agencies/${id}` : null, fetcher);
  return useSwrHelper(swr);
}

export function useAgencyMembers(id?: number) {
  const swr = useSWR<{ items: AgencyMember[] }>(
    id != null ? `/agencies/${id}/members` : null,
    fetcher,
  );
  return useSwrHelper(swr);
}

export function useUpdateAgency(id: number) {
  const swr = useSWRMutation(
    `/agencies/${id}`,
    patchFetcher<UpdateAgencyDto, Agency>,
  );
  return useSwrMutationHelper(swr);
}

export function useInviteMember(id: number) {
  const swr = useSWRMutation(
    `/agencies/${id}/members`,
    postFetcher<InviteAgencyMemberDto, AgencyMember>,
  );
  return useSwrMutationHelper(swr);
}

export function useRemoveMember(id: number) {
  const swr = useSWRMutation(
    `/agencies/${id}/members`,
    (url: string, { arg }: { arg: number }) =>
      deleteFetcher<{ success: boolean }>(`${url}/${arg}`),
  );
  return useSwrMutationHelper(swr);
}
