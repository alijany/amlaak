import { SWRResponse } from 'swr';
import { SWRMutationResponse } from 'swr/mutation';

export function useSwrHelper<Data, Error = unknown>(swr: SWRResponse<Data, Error>) {
  const { data, error, isLoading, mutate } = swr;
  
  const refresh = () => {
    mutate();
  };

  // Reset the current SWR state by clearing its cached data without revalidating.
  // Note: This uses the bound mutate for the current key, so no key is required.
  // Error state will be cleared on the next revalidation if present.
  const reset = (options?: { revalidate?: boolean }) => {
    return mutate(undefined, { revalidate: options?.revalidate ?? false });
  };
  
  return {
    data,
    error,
    isLoading,
    reset,
    refresh,
    mutate
  };
}

export function useSwrMutationHelper<Data, Error = unknown, RequestData = unknown>(
  swr: SWRMutationResponse<Data, Error, string, RequestData>
) {
  const { data, error, isMutating, trigger, reset } = swr;
  
  return {
    data,
    error,
    isLoading: isMutating,
    submit: trigger,
    reset
  };
}
