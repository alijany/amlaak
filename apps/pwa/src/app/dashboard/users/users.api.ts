import { fetcher, postFetcher } from "@/libs/api/api.util.fetcher";
import { useSwrHelper, useSwrMutationHelper } from "@/libs/api/api.hook.use-swr-helper";
import useSWR from "swr";
import { AddUserDto, GetUsersResponse, User, UserFilterDto } from "./users.types";
import useSWRMutation from "swr/mutation";


export function useUsers(filters?: UserFilterDto) {
const query = new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, value]) => value !== undefined && value !== null)
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value?.toString() || ''
      }), {})
  ).toString();

  const swr = useSWR<GetUsersResponse>(`/users?${query}`, fetcher);
  return useSwrHelper(swr);
}

export function useAddUser() {
  const swrMutation = useSWRMutation(
    '/users',
    postFetcher<AddUserDto, User>
  );
  return useSwrMutationHelper(swrMutation);
}