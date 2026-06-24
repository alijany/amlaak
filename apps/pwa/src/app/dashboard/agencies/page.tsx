'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { Button } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { toast } from 'react-toastify';
import { useConfirmAgency, usePendingAgencies, useRejectAgency } from './agencies.api';
import { PendingAgency } from './agencies.types';

function ownerLabel(agency: PendingAgency): string {
  const name =
    `${agency.owner?.firstName ?? ''} ${agency.owner?.lastName ?? ''}`.trim();
  return name || agency.owner?.phone || '—';
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fa-IR');
}

export default function PendingAgenciesPage() {
  const { data, error, isLoading, refresh } = usePendingAgencies();
  const { submit: confirm, isLoading: confirming } = useConfirmAgency();
  const { submit: reject, isLoading: rejecting } = useRejectAgency();

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

  return (
    <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
      <DashbaordLayout>
        <div className="space-y-4 grow flex flex-col overflow-auto">
          <h1 className="font-bold text-slate-800 text-xl">تأیید آژانس‌ها</h1>

          <div className="rounded-2xl bg-white p-4">
            <DataView
              data={data}
              error={error}
              isLoading={isLoading}
              isEmpty={(d) => !d?.items.length}
              emptyMessage="هیچ آژانس در انتظار تأییدی وجود ندارد."
              onRetry={refresh}
              variant="inline"
              className="divide-y divide-slate-100"
            >
              {data?.items?.map((agency) => (
                <div
                  key={agency.id}
                  className="flex items-center justify-between py-3 gap-4"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-sm font-semibold text-slate-700 truncate">
                      {agency.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {ownerLabel(agency)} · {agency.phone || '—'} · {formatDate(agency.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(agency.id)}
                      disabled={confirming || rejecting}
                    >
                      تأیید
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(agency.id)}
                      disabled={confirming || rejecting}
                    >
                      رد
                    </Button>
                  </div>
                </div>
              ))}
            </DataView>
          </div>
        </div>
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
