'use client';

import Link from 'next/link';
import { BlogPost, BlogPostStatus } from './blog.types';

interface PostCardProps {
  post: BlogPost;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function BlogPostCard({ post, onDelete, isDeleting }: PostCardProps) {
  return (
    <div className="px-4 py-3 rounded-2xl border border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-3 items-center">
      <div className="lg:col-span-2 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-slate-800">{post.title}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              post.status === BlogPostStatus.PUBLISHED
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {post.status === BlogPostStatus.PUBLISHED ? 'منتشر شده' : 'پیش‌نویس'}
          </span>
        </div>
        {post.excerpt && (
          <p className="text-sm text-slate-500 line-clamp-1">{post.excerpt}</p>
        )}
        <div className="text-xs text-slate-400">
          {post.author?.name ?? 'ناشناس'} ·{' '}
          {new Date(post.created_at).toLocaleDateString('fa-IR')}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/dashboard/blog/${post.id}/edit`}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          ویرایش
        </Link>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onDelete(post.id)}
          className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
