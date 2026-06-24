'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ApiError } from '@/libs/api/api.types.error';
import { Button, Input } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateLeadPool, useLeadPools } from '../leads.api';

function PoolsContent() {
  const { data, error, isLoading, refresh } = useLeadPools();
  const { submit, isLoading: creating } = useCreateLeadPool();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const onCreate = async () => {
    if (!name.trim()) return;
    try {
      await submit({ name: name.trim(), description: description || undefined });
      toast.success('صف ایجاد شد');
      setName('');
      setDescription('');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'ایجاد صف ناموفق بود');
    }
  };

  return (
    <div className="space-y-3 grow flex flex-col overflow-hidden">
      <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm"
        >
          <IconArrowRight size={16} />
          بازگشت
        </Link>
        <div className="w-px h-5 bg-slate-200" />
        <h1 className="font-bold text-slate-700">صف‌های مشتری</h1>
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <Input
          label="نام صف"
          value={name}
          onChange={(e) => setName(e.target.value)}
          containerClassName="grow"
        />
        <Input
          label="توضیح (اختیاری)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          containerClassName="grow"
        />
        <Button onClick={onCreate} disabled={creating || !name.trim()}>
          افزودن صف
        </Button>
      </div>

      <div className="grow overflow-auto">
        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage="هنوز صفی ساخته نشده است."
          onRetry={refresh}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {data?.items?.map((pool) => (
            <div
              key={pool.id}
              className="rounded-2xl border border-slate-100 bg-white p-4"
            >
              <div className="font-semibold text-slate-700">{pool.name}</div>
              {pool.description && (
                <div className="text-[12px] text-slate-500 mt-1">
                  {pool.description}
                </div>
              )}
              <div className="text-[11px] text-slate-400 mt-2">
                {pool.isActive ? 'فعال' : 'غیرفعال'}
              </div>
            </div>
          ))}
        </DataView>
      </div>
    </div>
  );
}

export default function LeadPoolsPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.MANAGER, Role.OWNER, Role.ADMIN]}>
      <DashbaordLayout>
        <PoolsContent />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
