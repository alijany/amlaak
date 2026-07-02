'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { useRouter } from 'next/navigation';
import { useCreatePost } from '../blog.api';
import { BlogPostForm } from '../blog.component.post-form';
import { CreatePostDto } from '../blog.types';

export default function CreateBlogPostPage() {
  const router = useRouter();
  const { submit, isLoading } = useCreatePost();

  const handleSubmit = async (dto: CreatePostDto) => {
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
            <div className="font-bold grow">مطلب جدید</div>
          </div>

          <div className="grow overflow-auto">
            <BlogPostForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
