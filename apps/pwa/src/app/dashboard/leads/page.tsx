'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { Button } from '@/ui/atoms';
import { DataView, Pagination } from '@/ui/molecules';
import { IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useLeads } from './leads.api';
import { CreateLeadModal } from './leads.component.create-modal';
import { LeadsFilters } from './leads.component.filters';
import { LeadRow } from './leads.component.list';
import { LeadFilters } from './leads.types';

function LeadsContent() {
  const [filters, setFilters] = useState<LeadFilters>({ page: 0, limit: 20 });
  const [modalOpen, setModalOpen] = useState(false);

  const { data, error, isLoading, refresh } = useLeads(filters);

  const patch = (p: Partial<LeadFilters>) =>
    setFilters((prev) => ({ ...prev, ...p }));

  const totalLabel = useMemo(
    () => (data?.meta ? `${data.meta.total.toLocaleString('fa-IR')} سرنخ` : ''),
    [data?.meta],
  );

  return (
    <div className="space-y-3 grow flex flex-col overflow-hidden">
      <div className="p-4 rounded-2xl bg-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-bold">سرنخ‌ها</div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-slate-400">{totalLabel}</span>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <IconPlus size={16} className="ml-1" />
              ثبت سرنخ
            </Button>
          </div>
        </div>
        <LeadsFilters filters={filters} onChange={patch} />
      </div>

      <div className="grow overflow-auto">
        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage="هنوز سرنخی ثبت نشده است. با دکمه «ثبت سرنخ» شروع کنید."
          onRetry={refresh}
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-3"
          >
            {data?.items?.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </DataView>

        {data?.meta && data.meta.total > (filters.limit || 20) && (
          <div className="pt-6">
            <Pagination
              itemPerPage={filters.limit || 20}
              page={(filters.page || 0) + 1}
              totalCount={data.meta.total}
              onNavigate={(page) => {
                patch({ page: page - 1 });
                return '#';
              }}
            />
          </div>
        )}
      </div>

      <CreateLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refresh}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <RoleProtectedRoute allowedRoles={RouteItems.leads.roles}>
      <DashbaordLayout>
        <LeadsContent />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
