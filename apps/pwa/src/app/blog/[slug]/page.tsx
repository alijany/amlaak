import { serverFetcher, serverFetcherWithStatus } from '@/libs/api/api.util.server-fetcher';
import { SlateRenderer } from '@/ui/molecules/slate-editor/ui.slate-renderer';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { BlogPost, BlogPostStatus, GetBlogPostsResponse } from '../../dashboard/blog/blog.types';

export const revalidate = 3600;

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

export async function generateStaticParams() {
  try {
    const { items } = await serverFetcher<GetBlogPostsResponse>(
      '/blog?status=published&limit=1000',
    );
    return items.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: post, status } = await serverFetcherWithStatus<BlogPost>(`/blog/${slug}`);

  if (!post || status >= 400) return { title: 'مطلب یافت نشد' };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const isNoindex = post.status === BlogPostStatus.NOINDEX;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: `${baseUrl}/blog/${post.slug}` },
    robots: isNoindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.ogImage
        ? [post.ogImage]
        : post.coverImage
          ? [post.coverImage]
          : [],
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: post, status } = await serverFetcherWithStatus<BlogPost>(`/blog/${slug}`);

  // 410 Gone — de-index; treat as not found so Next.js sends 404
  // (Next.js App Router has no native 410; Google treats persistent 404 as removal)
  if (status === 410 || !post) notFound();

  // 301 Redirect — permanentRedirect sends HTTP 308 (SEO-equivalent of 301 for Next.js)
  if (status === 301) {
    const redirectPost = post as BlogPost & { url?: string };
    permanentRedirect(redirectPost.url ?? '/blog');
  }

  // Regular 404 / draft / future scheduled
  if (status === 404) notFound();

  const mins = readingTime(post.body ?? '');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author?.name ?? '',
    },
    url: `${baseUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8"
        >
          <span>→</span>
          بازگشت به وبلاگ
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative w-full h-64 lg:h-80 mb-8 rounded-2xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-4">
            {post.categories?.map((c) => (
              <span key={c.id} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                {c.name}
              </span>
            ))}
            {post.publishedAt && (
              <>
                <span className="text-slate-300">·</span>
                <span>{new Date(post.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <span>{mins} دقیقه مطالعه</span>
            {post.author?.name && (
              <>
                <span className="text-slate-300">·</span>
                <span>نوشته: {post.author.name}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-slate-500 leading-relaxed border-r-4 border-slate-200 pr-4">
              {post.excerpt}
            </p>
          )}
        </header>

        <hr className="border-slate-100 mb-10" />

        <SlateRenderer content={post.body} className="text-slate-800 text-base leading-8" />

        <div className="mt-16 pt-8 border-t border-slate-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <span>→</span>
            بازگشت به وبلاگ
          </Link>
        </div>
      </main>
    </>
  );
}
