'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { DataView, Pagination } from '@/ui/molecules';
import Link from 'next/link';
import { useState } from 'react';
import { useBlogPosts } from './blog.api';
import { BlogPostCard } from './blog.component.post-card';
import { BlogFilterDto } from './blog.types';
import { deleteFetcher } from '@/libs/api/api.util.fetcher';

export default function BlogManagePage() {
  const [filters, setFilters] = useState<BlogFilterDto>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { data, error, isLoading, refresh } = useBlogPosts(filters);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page: page - 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این مطلب مطمئن هستید؟')) return;
    setDeletingId(id);
    try {
      await deleteFetcher(`/blog/${id}`);
      refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.blog.roles}>
      <DashbaordLayout>
        <div className="space-y-3 grow flex flex-col overflow-hidden">
          <div className="p-4 rounded-2xl bg-white flex items-center gap-4 justify-between">
            <div className="font-bold grow">مدیریت وبلاگ</div>
            <Link
              href="/dashboard/blog/create"
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              + مطلب جدید
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white grow flex flex-col overflow-hidden">
            <DataView
              data={data}
              error={error}
              isLoading={isLoading}
              className="overflow-auto flex flex-col gap-3"
              emptyMessage="هیچ مطلبی وجود ندارد"
              isEmpty={(d) => !d?.items.length}
              onRetry={refresh}
            >
              {data?.items?.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDelete}
                  isDeleting={deletingId === post.id}
                />
              ))}

              {data?.meta && (
                <div className="pt-6">
                  <Pagination
                    itemPerPage={filters.limit || 10}
                    page={(filters.page || 0) + 1}
                    totalCount={data.meta.total}
                    onNavigate={(page) => { handlePageChange(page); return '#'; }}
                  />
                </div>
              )}
            </DataView>
          </div>
        </div>
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
