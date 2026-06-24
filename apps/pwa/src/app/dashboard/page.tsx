'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { DataView } from '@/ui/molecules';
import {
  IconBuildingEstate,
  IconChevronLeft,
  IconPhoneCall,
  IconTrophy,
  IconUserCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useAdvertisements } from './crawler/ads/crawler.ads.api';
import { AdCard } from './crawler/ads/crawler.ads.component.list';
import { useLeadStats } from './leads/leads.api';
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER } from './leads/leads.constants';
import { LeadStatus } from './leads/leads.types';

function Kpi({
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

function fa(n?: number): string {
  return (n ?? 0).toLocaleString('fa-IR');
}

function DashboardContent() {
  const { user } = useAuth();
  const stats = useLeadStats();
  const ads = useAdvertisements({ page: 0, limit: 6 });

  const byStatus = stats.data?.byStatus;

  return (
    <div className="space-y-4 grow flex flex-col overflow-auto">
      {/* Greeting */}
      <div>
        <h1 className="font-bold text-slate-800 text-xl">
          سلام{user?.firstName ? `، ${user.firstName}` : ''} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          نمای کلی فعالیت پلتفرم نوا املاک
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={<IconBuildingEstate size={20} />}
          label="کل آگهی‌ها"
          value={fa(ads.data?.meta?.total)}
        />
        <Kpi
          icon={<IconPhoneCall size={20} />}
          label="مشتری‌های جدید"
          value={fa(byStatus?.[LeadStatus.NEW])}
          href={RouteItems.leads.href}
        />
        <Kpi
          icon={<IconUserCheck size={20} />}
          label="مشتری‌های من"
          value={fa(stats.data?.mine)}
          href={RouteItems.leads.href}
        />
        <Kpi
          icon={<IconTrophy size={20} />}
          label="موفق"
          value={fa(byStatus?.[LeadStatus.WON])}
          href={RouteItems.leads.href}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead funnel */}
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

        {/* Recent listings */}
        <div className="rounded-2xl bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-slate-700">آخرین آگهی‌ها</div>
            <Link
              href={RouteItems.crawlerAds.href}
              className="text-[12px] text-blue-500 hover:underline flex items-center"
            >
              همه
              <IconChevronLeft size={14} />
            </Link>
          </div>
          <DataView
            data={ads.data}
            error={ads.error}
            isLoading={ads.isLoading}
            isEmpty={(d) => !d?.items.length}
            emptyMessage="هنوز آگهی‌ای گردآوری نشده است."
            onRetry={ads.refresh}
            variant="inline"
          >
            <div
              className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}
            >
              {ads.data?.items?.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </DataView>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RoleProtectedRoute allowedRoles={RouteItems.dashboard.roles}>
      <DashbaordLayout>
        <DashboardContent />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
