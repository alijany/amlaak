'use client';

import { useAuth } from '@/components/auth/auth.context.provider';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DataView } from '@/ui/molecules';
import { IconChevronLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useLeadStats } from './leads/leads.api';
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER } from './leads/leads.constants';

export function Kpi({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl bg-white p-4 flex items-center gap-3 h-full">
      <div className="rounded-xl bg-slate-50 p-2.5 text-slate-500">{icon}</div>
      <div className="min-w-0">
        <div className="text-[12px] text-slate-400">{label}</div>
        <div className="font-bold text-slate-800 text-lg">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-90 transition-opacity">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function fa(n?: number): string {
  return (n ?? 0).toLocaleString('fa-IR');
}

export function Greeting({ subtitle }: { subtitle: string }) {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="font-bold text-slate-800 text-xl">
        سلام{user?.firstName ? `، ${user.firstName}` : ''} 👋
      </h1>
      <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>
    </div>
  );
}

/** Lead funnel card (agency-scoped or platform-wide depending on the auth header). */
export function LeadFunnelCard() {
  const stats = useLeadStats();
  const byStatus = stats.data?.byStatus;

  return (
    <div className="rounded-2xl bg-white p-4 lg:col-span-1">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-slate-700">قیف مشتری‌ها</div>
        <Link
          href={RouteItems.leads.href}
          className="text-[12px] text-blue-500 hover:underline flex items-center"
        >
          همه
          <IconChevronLeft size={14} />
        </Link>
      </div>
      <DataView
        data={stats.data}
        error={stats.error}
        isLoading={stats.isLoading}
        onRetry={stats.refresh}
        variant="inline"
        className="space-y-2"
      >
        {LEAD_STATUS_ORDER.map((s) => {
          const count = byStatus?.[s] ?? 0;
          const total = stats.data?.total || 1;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={s} className="space-y-1">
              <div className="flex justify-between text-[12px] text-slate-500">
                <span>{LEAD_STATUS_LABEL[s]}</span>
                <span>{fa(count)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </DataView>
    </div>
  );
}
