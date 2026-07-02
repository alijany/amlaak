import { serverFetcher } from '@/libs/api/api.util.server-fetcher';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, GetBlogPostsResponse } from '../dashboard/blog/blog.types';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'وبلاگ',
  description: 'آخرین مطالب و مقالات',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    title: 'وبلاگ',
    description: 'آخرین مطالب و مقالات',
  },
};

function readingTime(body: string): number {
  try {
    const nodes: Array<{ children?: Array<{ text?: string }> }> = JSON.parse(body);
    const text = nodes
      .flatMap((n) => n.children ?? [])
      .map((c) => c.text ?? '')
      .join(' ');
    return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
  } catch {
    return 1;
  }
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const mins = readingTime(post.body ?? '');

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        {post.coverImage && (
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative w-full h-72 lg:h-96">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 900px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
          </Link>
        )}
        <div className={post.coverImage ? 'p-6' : 'p-8'}>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
            {post.categories?.map((c) => (
              <span key={c.id} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                {c.name}
              </span>
            ))}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString('fa-IR')}</span>
            )}
            <span>{mins} دقیقه مطالعه</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">
            <Link href={`/blog/${post.slug}`} className="hover:text-slate-600 transition-colors">
              {post.title}
            </Link>
          </h2>
          {post.excerpt && (
            <p className="text-slate-500 leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
          )}
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            ادامه مطلب
            <span className="text-base">←</span>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {post.coverImage && (
        <Link href={`/blog/${post.slug}`} className="block shrink-0">
          <div className="relative w-full h-44">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </Link>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
          {post.categories?.map((c) => (
            <span key={c.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {c.name}
            </span>
          ))}
          {post.publishedAt && (
            <span>{new Date(post.publishedAt).toLocaleDateString('fa-IR')}</span>
          )}
          <span>{mins} دقیقه</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug flex-1">
          <Link href={`/blog/${post.slug}`} className="hover:text-slate-600 transition-colors">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mt-auto"
        >
          ادامه مطلب ←
        </Link>
      </div>
    </article>
  );
}

export default async function BlogListPage() {
  let response: GetBlogPostsResponse;
  try {
    response = await serverFetcher<GetBlogPostsResponse>(
      '/blog?status=published&limit=20',
    );
  } catch {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-lg">در حال حاضر مطلبی موجود نیست.</p>
      </div>
    );
  }

  const posts = response.items;

  if (posts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center h-96">
        <h1 className="text-3xl font-bold mb-4">وبلاگ</h1>
        <p className="text-slate-400 text-lg">هنوز مطلبی منتشر نشده است.</p>
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <main className="max-w-5xl mx-auto px-4 py-12" dir="rtl">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">وبلاگ</h1>
        <p className="text-slate-500">آخرین مطالب و مقالات</p>
      </div>

      {/* Featured post */}
      <div className="mb-10">
        <PostCard post={featured} featured />
      </div>

      {/* Grid of remaining posts */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post: BlogPost) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
