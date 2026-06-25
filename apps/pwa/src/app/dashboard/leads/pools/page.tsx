'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ApiError } from '@/libs/api/api.types.error';
import { Button, Input, Modal } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { IconArrowRight, IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import { useAllAgencies } from '@/app/dashboard/agency/agency.api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateLeadPool, useLeadPools, useUpdateLeadPool } from '../leads.api';
import { LeadPool } from '../leads.types';

function AgencyMultiSelect({
  label,
  allAgencies,
  selected,
  onChange,
}: {
  label: string;
  allAgencies: { id: number; name: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) =>
    onChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
    );

  return (
    <div>
      <label className="font-medium mb-2 block text-slate-700 text-sm">{label}</label>
      <div className="flex flex-wrap gap-2">
        {allAgencies.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => toggle(a.id)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              selected.includes(a.id)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
            }`}
          >
            {a.name}
          </button>
        ))}
        {allAgencies.length === 0 && (
          <span className="text-xs text-slate-400">آژانسی یافت نشد</span>
        )}
      </div>
    </div>
  );
}

function CreatePoolModal({
  isOpen,
  onClose,
  onCreated,
  allAgencies,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  allAgencies: { id: number; name: string }[];
}) {
  const { submit, isLoading } = useCreateLeadPool();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agencyIds, setAgencyIds] = useState<number[]>([]);

  const reset = () => {
    setName('');
    setDescription('');
    setAgencyIds([]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await submit({ name: name.trim(), description: description || undefined, agencyIds });
      toast.success('صف ایجاد شد');
      onCreated();
      close();
    } catch (e) {
      toast.error((e as ApiError).message || 'ایجاد صف ناموفق بود');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} className="lg:w-[28rem] flex flex-col">
      <div className="contents">
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="font-bold text-slate-700">ایجاد صف جدید</h2>
          <button onClick={close} className="text-slate-400 hover:text-slate-700">
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-5 py-4 space-y-4">
          <Input
            label="نام صف"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="توضیح (اختیاری)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <AgencyMultiSelect
            label="آژانس‌های عضو"
            allAgencies={allAgencies}
            selected={agencyIds}
            onChange={setAgencyIds}
          />
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <Button variant="outline" onClick={close}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            ایجاد صف
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditPoolModal({
  pool,
  onClose,
  onSaved,
  allAgencies,
}: {
  pool: LeadPool | null;
  onClose: () => void;
  onSaved: () => void;
  allAgencies: { id: number; name: string }[];
}) {
  const { submit: updatePool, isLoading: updating } = useUpdateLeadPool(pool?.id || 0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agencyIds, setAgencyIds] = useState<number[]>([]);

  useEffect(() => {
    if (pool) {
      setName(pool.name);
      setDescription(pool.description ?? '');
      setAgencyIds(pool.agencies.map((a) => a.agency.id));
    }
  }, [pool]);

  const handleSave = async () => {
    if (!pool || !name.trim()) return;
    try {
      await updatePool({ name: name.trim(), description: description || undefined, agencyIds });
      toast.success('صف به‌روزرسانی شد');
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as ApiError).message || 'خطا در به‌روزرسانی صف');
    }
  };

  return (
    <Modal isOpen={!!pool} onClose={onClose} className="lg:w-[28rem] flex flex-col">
      <div className="contents">
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="font-bold text-slate-700">ویرایش صف</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-5 py-4 space-y-4">
          <Input
            label="نام صف"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="توضیح (اختیاری)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <AgencyMultiSelect
            label="آژانس‌های عضو"
            allAgencies={allAgencies}
            selected={agencyIds}
            onChange={setAgencyIds}
          />
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={updating || !name.trim()}>
            ذخیره
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PoolsContent() {
  const { data, error, isLoading, refresh } = useLeadPools();
  // Pools are admin-managed and may include any agency, so list all of them
  // (not just the admin's own) — pools route leads across agencies.
  const { data: agencies } = useAllAgencies();
  const allAgencies = agencies?.items ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<LeadPool | null>(null);

  const onStartEdit = (pool: LeadPool) => setEditingPool(pool);
  const onCloseEdit = () => setEditingPool(null);

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
        <h1 className="font-bold text-slate-700 flex-1">صف‌های مشتری</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <IconPlus size={16} className="ml-1" />
          صف جدید
        </Button>
      </div>

      <div className="grow overflow-auto">
        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage="هنوز صفی ساخته نشده است. با دکمه «صف جدید» شروع کنید."
          onRetry={refresh}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.items?.map((pool) => (
              <div
                key={pool.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-700 truncate">{pool.name}</div>
                    {pool.description && (
                      <div className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">
                        {pool.description}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onStartEdit(pool)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <IconPencil size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {pool.agencies.map((a) => (
                    <span
                      key={a.agency.id}
                      className="text-[10px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5"
                    >
                      {a.agency.name}
                    </span>
                  ))}
                  {pool.agencies.length === 0 && (
                    <span className="text-[10px] text-slate-400">بدون آژانس</span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mt-auto pt-1 border-t border-slate-50">
                  {pool.isActive ? 'فعال' : 'غیرفعال'}
                </div>
              </div>
            ))}
          </div>
        </DataView>
      </div>

      <CreatePoolModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
        allAgencies={allAgencies}
      />

      <EditPoolModal
        pool={editingPool}
        onClose={onCloseEdit}
        onSaved={refresh}
        allAgencies={allAgencies}
      />
    </div>
  );
}

export default function LeadPoolsPage() {
  return (
    <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
      <DashbaordLayout>
        <PoolsContent />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
