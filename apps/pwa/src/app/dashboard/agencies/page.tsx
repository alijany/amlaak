'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { Button, Input } from '@/ui/atoms';
import { DataView, Pagination } from '@/ui/molecules';
import { IconSettings } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useAgencies,
  useConfirmAgency,
  useReactivateAgency,
  useRejectAgency,
} from './agencies.api';
import { AdminAgency, AgencyFilterDto, AgencyStatusFilter } from './agencies.types';

const STATUS_TABS: { value: AgencyStatusFilter; label: string }[] = [
  { value: 'all', label: 'همه' },
  { value: 'pending', label: 'در انتظار تأیید' },
  { value: 'active', label: 'فعال' },
  { value: 'inactive', label: 'غیرفعال' },
];

function ownerLabel(agency: AdminAgency): string {
  const name =
    `${agency.owner?.firstName ?? ''} ${agency.owner?.lastName ?? ''}`.trim();
  return name || agency.owner?.phone || '—';
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fa-IR');
}

function StatusBadge({ agency }: { agency: AdminAgency }) {
  if (!agency.isActive) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 text-[11px] font-semibold">
        غیرفعال
      </span>
    );
  }
  if (!agency.isConfirmed) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-semibold">
        در انتظار تأیید
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
      تأیید‌شده
    </span>
  );
}

function DeliveryBadge({ agency }: { agency: AdminAgency }) {
  const mode = agency.leadDelivery ?? 'disabled';
  if (mode === 'telegram') {
    return (
      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[11px] font-semibold">
        تلگرام
      </span>
    );
  }
  if (mode === 'sms') {
    return (
      <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        پیامک
      </span>
    );
  }
  return null;
}

export default function AgenciesPage() {
  const [filters, setFilters] = useState<AgencyFilterDto>({
    status: 'all',
    page: 0,
  });

  const { data, error, isLoading, refresh } = useAgencies(filters);
  const { submit: confirm, isLoading: confirming } = useConfirmAgency();
  const { submit: reject, isLoading: rejecting } = useRejectAgency();
  const { submit: reactivate, isLoading: reactivating } = useReactivateAgency();

  const busy = confirming || rejecting || reactivating;

  const handleConfirm = async (id: number) => {
    try {
      await confirm(id);
      toast.success('آژانس تأیید شد');
      refresh();
    } catch {
      toast.error('خطا در تأیید آژانس');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await reject(id);
      toast.success('آژانس رد شد');
      refresh();
    } catch {
      toast.error('خطا در رد آژانس');
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await reactivate(id);
      toast.success('آژانس فعال شد');
      refresh();
    } catch {
      toast.error('خطا در فعال‌سازی آژانس');
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page: page - 1 }));
  };

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.agencies.roles}>
      <DashbaordLayout>
        <div className="space-y-3 grow flex flex-col overflow-hidden">
          <div className="p-4 rounded-2xl bg-white space-y-3">
            <div className="flex items-center gap-4 justify-between flex-wrap">
              <div className="font-bold grow">مدیریت آژانس‌ها</div>
              <div className="w-full sm:w-64">
                <Input
                  placeholder="جستجوی نام آژانس..."
                  value={filters.search ?? ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value || undefined,
                      page: 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_TABS.map((tab) => {
                const active = (filters.status ?? 'all') === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        status: tab.value,
                        page: 0,
                      }))
                    }
                    className={
                      active
                        ? 'px-3 py-1.5 rounded-full bg-slate-800 text-white text-xs font-semibold'
                        : 'px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold hover:bg-slate-200'
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white grow flex flex-col overflow-hidden">
            <DataView
              data={data}
              error={error}
              isLoading={isLoading}
              isEmpty={(d) => !d?.items.length}
              emptyMessage="هیچ آژانسی یافت نشد."
              onRetry={refresh}
              className="overflow-auto flex flex-col gap-3"
            >
              {data?.items?.map((agency) => (
                <div
                  key={agency.id}
                  className="px-3 py-2.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 truncate">
                        {agency.name}
                      </span>
                      <StatusBadge agency={agency} />
                      <DeliveryBadge agency={agency} />
                    </div>
                    <div className="text-xs text-slate-400">
                      {ownerLabel(agency)} · {agency.phone || '—'} ·{' '}
                      {formatDate(agency.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    {agency.isActive && !agency.isConfirmed && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(agency.id)}
                          disabled={busy}
                        >
                          تأیید
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(agency.id)}
                          disabled={busy}
                        >
                          رد
                        </Button>
                      </>
                    )}
                    {!agency.isActive && (
                      <Button
                        size="sm"
                        onClick={() => handleReactivate(agency.id)}
                        disabled={busy}
                      >
                        فعال‌سازی
                      </Button>
                    )}
                    <Link href={`/dashboard/agencies/${agency.id}`}>
                      <Button size="sm" variant="outline">
                        <IconSettings size={16} className="ml-1" />
                        مدیریت
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {data?.meta && (
                <div className="pt-6">
                  <Pagination
                    itemPerPage={filters.limit || 10}
                    page={(filters.page || 0) + 1}
                    totalCount={data.meta.total}
                    onNavigate={(page) => {
                      handlePageChange(page);
                      return '#';
                    }}
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
