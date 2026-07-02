'use client';

import { usePublicBlogPosts } from '@/app/dashboard/blog/blog.api';
import { BlogPost } from '@/app/dashboard/blog/blog.types';
import { DataView } from '@/ui/molecules';
import { IconChevronLeft } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

function BlogStripCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {post.coverImage && (
        <Link href={`/blog/${post.slug}`} className="block shrink-0">
          <div className="relative w-full h-40">
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
      <div className="p-4 flex flex-col flex-1">
        {post.publishedAt && (
          <span className="text-xs text-slate-400 mb-2">
            {new Date(post.publishedAt).toLocaleDateString('fa-IR')}
          </span>
        )}
        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug flex-1">
          <Link href={`/blog/${post.slug}`} className="hover:text-slate-600 transition-colors">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </article>
  );
}

export function LandingBlogStrip() {
  const { data, error, isLoading } = usePublicBlogPosts({ limit: 3 });

  if (!isLoading && !error && !data?.items.length) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-800">آخرین مطالب وبلاگ</h2>
          <Link
            href="/blog"
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            مشاهده همه
            <IconChevronLeft size={16} />
          </Link>
        </div>

        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          variant="inline"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.items?.map((post) => (
              <BlogStripCard key={post.id} post={post} />
            ))}
          </div>
        </DataView>
      </div>
    </section>
  );
}
