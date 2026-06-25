'use client';

import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DataView } from '@/ui/molecules';
import {
  IconBuildingCommunity,
  IconBuildingEstate,
  IconChevronLeft,
  IconTrophy,
  IconUserCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useAgencies } from './agencies/agencies.api';
import { useAdvertisements } from './crawler/ads/crawler.ads.api';
import { AdCard } from './crawler/ads/crawler.ads.component.list';
import { Greeting, Kpi, LeadFunnelCard, fa } from './dashboard.component.shared';
import { useLeadStats } from './leads/leads.api';
import { LeadStatus } from './leads/leads.types';

/** Platform overview — admin sees global ads, lead stats, and an agencies entry point. */
export function AdminDashboard() {
  const stats = useLeadStats();
  const ads = useAdvertisements({ page: 0, limit: 6 });
  const agencies = useAgencies({ page: 0, limit: 1 });

  const byStatus = stats.data?.byStatus;

  return (
    <div className="space-y-4 grow flex flex-col overflow-auto">
      <Greeting subtitle="نمای کلی فعالیت پلتفرم نوا املاک" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={<IconBuildingCommunity size={20} />}
          label="آژانس‌ها"
          value={fa(agencies.data?.meta?.total)}
          href={RouteItems.agencies.href}
        />
        <Kpi
          icon={<IconBuildingEstate size={20} />}
          label="کل آگهی‌ها"
          value={fa(ads.data?.meta?.total)}
          href={RouteItems.crawlerAds.href}
        />
        <Kpi
          icon={<IconUserCheck size={20} />}
          label="کل مشتری‌ها"
          value={fa(stats.data?.total)}
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
        <LeadFunnelCard />

        {/* Recent crawled ads */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
