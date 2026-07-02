import { serverFetcher } from '@/libs/api/api.util.server-fetcher';
import type { MetadataRoute } from 'next';
import { BlogPostStatus, GetBlogPostsResponse } from './dashboard/blog/blog.types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/blog`, changeFrequency: 'daily', priority: 0.9 },
  ];

  try {
    const { items } = await serverFetcher<GetBlogPostsResponse>(
      '/blog?status=published&limit=1000',
      86400,
    );
    // Exclude noindex posts — they are published but shouldn't appear in sitemap
    const postRoutes: MetadataRoute.Sitemap = items
      .filter((p) => p.status !== BlogPostStatus.NOINDEX)
      .map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
