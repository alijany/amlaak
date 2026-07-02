'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { DataView } from '@/ui/molecules';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useBlogPost, useUpdatePost } from '../../blog.api';
import { BlogPostForm } from '../../blog.component.post-form';
import { UpdatePostDto } from '../../blog.types';

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = Number(id);
  const router = useRouter();

  const { data: post, error, isLoading } = useBlogPost(postId);
  const { submit, isLoading: isSaving } = useUpdatePost(postId);

  const handleSubmit = async (dto: UpdatePostDto) => {
    await submit(dto);
    router.push('/dashboard/blog');
  };

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.blog.roles}>
      <DashbaordLayout>
        <div className="space-y-3 grow flex flex-col overflow-hidden">
          <div className="p-4 rounded-2xl bg-white flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-slate-500 hover:text-slate-800 text-sm"
            >
              ← بازگشت
            </button>
            <div className="font-bold grow">ویرایش مطلب</div>
          </div>

          <div className="rounded-2xl grow overflow-auto">
            <DataView
              data={post}
              error={error}
              isLoading={isLoading}
              isEmpty={(d) => !d}
              emptyMessage="مطلب یافت نشد"
            >
              {post && (
                <BlogPostForm
                  initialData={post}
                  onSubmit={handleSubmit}
                  isLoading={isSaving}
                />
              )}
            </DataView>
          </div>
        </div>
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
