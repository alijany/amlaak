'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { DataView, Pagination } from '@/ui/molecules';
import { useState } from 'react';
import { useLeads, useUpdateLead } from './leads.api';
import {
  Lead,
  LeadFilterDto,
  LeadStatus,
  LeadStatusColors,
  LeadStatusLabels,
} from './leads.types';

function LeadStatusUpdater({ lead, onUpdated }: { lead: Lead; onUpdated: () => void }) {
  const { submit, isLoading } = useUpdateLead(lead.id);

  const handleChange = async (status: LeadStatus) => {
    await submit({ status });
    onUpdated();
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.values(LeadStatus) as LeadStatus[]).map((s) => (
        <button
          key={s}
          type="button"
          disabled={isLoading}
          onClick={() => handleChange(s)}
          className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
            lead.status === s
              ? LeadStatusColors[s]
              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {LeadStatusLabels[s]}
        </button>
      ))}
    </div>
  );
}

function LeadRow({ lead, onUpdated }: { lead: Lead; onUpdated: () => void }) {
  const date = new Date(lead.created_at).toLocaleDateString('fa-IR');

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-800">{lead.name}</span>
          <span className="text-sm text-slate-500" dir="ltr">{lead.phone}</span>
          {lead.businessName && (
            <span className="text-sm text-slate-500">{lead.businessName}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-slate-400">
          <span>{date}</span>
          {lead.service && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{lead.service}</span>
          )}
          {lead.businessSize && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{lead.businessSize}</span>
          )}
        </div>
      </div>

      {lead.message && (
        <p className="text-sm text-slate-600 leading-relaxed bg-white rounded-lg px-3 py-2 border border-slate-100">
          {lead.message}
        </p>
      )}

      <LeadStatusUpdater lead={lead} onUpdated={onUpdated} />
    </div>
  );
}

export default function LeadsManagePage() {
  const [filters, setFilters] = useState<LeadFilterDto>({});
  const { data, error, isLoading, refresh } = useLeads(filters);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page: page - 1 }));
  };

  return (
    <RoleProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
      <DashbaordLayout>
        <div className="space-y-3 grow flex flex-col overflow-hidden">
          <div className="p-4 rounded-2xl bg-white flex items-center gap-4 justify-between">
            <div className="font-bold grow">مدیریت سرنخ‌ها</div>
            <span className="text-sm text-slate-400">
              {data?.meta?.total !== undefined ? `${data.meta.total} سرنخ` : ''}
            </span>
          </div>

          {/* Status filter */}
          <div className="p-4 rounded-2xl bg-white flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, status: undefined, page: 0 }))}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                !filters.status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              همه
            </button>
            {(Object.values(LeadStatus) as LeadStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilters((p) => ({ ...p, status: s, page: 0 }))}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  filters.status === s
                    ? LeadStatusColors[s]
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {LeadStatusLabels[s]}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-white grow flex flex-col overflow-hidden" dir="rtl">
            <DataView
              data={data}
              error={error}
              isLoading={isLoading}
              className="overflow-auto flex flex-col gap-3"
              emptyMessage="هیچ سرنخی وجود ندارد"
              isEmpty={(d) => !d?.items.length}
              onRetry={refresh}
            >
              {data?.items?.map((lead) => (
                <LeadRow key={lead.id} lead={lead} onUpdated={refresh} />
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
