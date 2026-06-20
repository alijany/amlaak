import {
  useSwrHelper,
  useSwrMutationHelper,
} from '@/libs/api/api.hook.use-swr-helper';
import {
  fetcher,
  postFetcher,
} from '@/libs/api/api.util.fetcher';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  AuthView,
  BrowserHealth,
  CrawlJob,
  CrawlJobsResponse,
  CrawlTarget,
  CreateJobDto,
  ProviderMetadata,
} from './crawler.types';

// --- targets -----------------------------------------------------------

export function useCrawlTargets() {
  const swr = useSWR<{ items: CrawlTarget[] }>('/crawler/targets', fetcher);
  return useSwrHelper(swr);
}

export function useCrawlerProviders() {
  const swr = useSWR<ProviderMetadata[]>('/crawler/targets/providers', fetcher);
  return useSwrHelper(swr);
}

export function useBrowserStatus() {
  const swr = useSWR<BrowserHealth>('/crawler/targets/browser', fetcher, {
    refreshInterval: 30_000,
  });
  return useSwrHelper(swr);
}

// --- auth (interactive OTP) -------------------------------------------

export function useTargetAuth(targetId?: number) {
  const swr = useSWR<AuthView>(
    targetId ? `/crawler/targets/${targetId}/auth` : null,
    fetcher,
  );
  return useSwrHelper(swr);
}

export function useStartLogin(targetId: number) {
  const swr = useSWRMutation(
    `/crawler/targets/${targetId}/auth/start`,
    postFetcher<{ phone: string }, AuthView>,
  );
  return useSwrMutationHelper(swr);
}

export function useVerifyOtp(targetId: number) {
  const swr = useSWRMutation(
    `/crawler/targets/${targetId}/auth/verify`,
    postFetcher<{ otp: string }, AuthView>,
  );
  return useSwrMutationHelper(swr);
}

export function useLogoutTarget(targetId: number) {
  const swr = useSWRMutation(
    `/crawler/targets/${targetId}/auth/logout`,
    postFetcher<undefined, AuthView>,
  );
  return useSwrMutationHelper(swr);
}

// --- jobs --------------------------------------------------------------

export function useEnqueueJob(targetId: number) {
  const swr = useSWRMutation(
    `/crawler/targets/${targetId}/jobs`,
    postFetcher<CreateJobDto, CrawlJob>,
  );
  return useSwrMutationHelper(swr);
}

export function useCrawlJobs(targetId?: number) {
  const query = targetId ? `?targetId=${targetId}&limit=10` : '?limit=10';
  const swr = useSWR<CrawlJobsResponse>(`/crawler/jobs${query}`, fetcher);
  return useSwrHelper(swr);
}
