import {
  deleteFetcher,
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
  BlogCategory,
  BlogFilterDto,
  BlogPost,
  CreatePostDto,
  GetBlogPostsResponse,
  UpdatePostDto,
} from './blog.types';

function buildQuery(filters?: BlogFilterDto): string {
  return new URLSearchParams(
    Object.entries(filters || {})
      .filter(([, v]) => v !== undefined && v !== null)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
  ).toString();
}

export function useBlogPosts(filters?: BlogFilterDto) {
  const query = buildQuery(filters);
  return useSwrHelper(
    useSWR<GetBlogPostsResponse>(`/blog/manage/posts?${query}`, fetcher),
  );
}

export function useBlogPost(id?: number) {
  return useSwrHelper(
    useSWR<BlogPost>(id ? `/blog/manage/posts/${id}` : null, fetcher),
  );
}

export function useCreatePost() {
  return useSwrMutationHelper(
    useSWRMutation('/blog', postFetcher<CreatePostDto, BlogPost>),
  );
}

export function useUpdatePost(id: number) {
  return useSwrMutationHelper(
    useSWRMutation(`/blog/${id}`, patchFetcher<UpdatePostDto, BlogPost>),
  );
}

export function useDeletePost(id: number) {
  return useSwrMutationHelper(
    useSWRMutation(`/blog/${id}`, deleteFetcher<{ success: boolean }>),
  );
}

export function useBlogCategories() {
  return useSwrHelper(useSWR<BlogCategory[]>('/blog/categories', fetcher));
}

export function useCreateCategory() {
  return useSwrMutationHelper(
    useSWRMutation(
      '/blog/categories',
      postFetcher<{ name: string; slug: string }, BlogCategory>,
    ),
  );
}
