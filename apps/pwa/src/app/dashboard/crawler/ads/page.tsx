'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { Role } from '@/components/auth/auth.constants.roles';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { QuickLeadModal } from '@/app/dashboard/listings/listings.component.lead-modal';
import { DataView, Pagination } from '@/ui/molecules';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { AdvertisementFilters, AdvertisementSource } from '../crawler.types';
import { useAdvertisements } from './crawler.ads.api';
import { AdsFilters } from './crawler.ads.component.filters';
import { AdCard } from './crawler.ads.component.list';

const TABS: { label: string; source: AdvertisementSource }[] = [
  { label: 'گردآوری‌شده', source: AdvertisementSource.CRAWLER },
  { label: 'آژانس', source: AdvertisementSource.USER },
];

function AdsContent() {
  const searchParams = useSearchParams();
  const initialTargetId = searchParams.get('targetId');

  const { hasAnyRole } = useAuth();
  const canManageLeads = hasAnyRole([Role.ADMIN, Role.MANAGER, Role.OWNER]);

  const [activeSource, setActiveSource] = useState<AdvertisementSource>(
    AdvertisementSource.CRAWLER,
  );

  const [filters, setFilters] = useState<AdvertisementFilters>({
    page: 0,
    limit: 12,
    source: AdvertisementSource.CRAWLER,
    targetId: initialTargetId ? Number(initialTargetId) : undefined,
  });
  const [leadAd, setLeadAd] = useState<{
    id: number;
    title?: string;
    agency?: { id: number; name: string; isPlatform?: boolean };
  } | null>(null);

  const { data, error, isLoading, refresh } = useAdvertisements(filters);

  const patch = (p: Partial<AdvertisementFilters>) =>
    setFilters((prev) => ({ ...prev, ...p }));

  const handleTabChange = (source: AdvertisementSource) => {
    setActiveSource(source);
    setFilters({
      page: 0,
      limit: 12,
      source,
      targetId: source === AdvertisementSource.CRAWLER
        ? (initialTargetId ? Number(initialTargetId) : undefined)
        : undefined,
    });
  };

  const totalLabel = useMemo(
    () => (data?.meta ? `${data.meta.total.toLocaleString('fa-IR')} آگهی` : ''),
    [data?.meta],
  );

  const emptyMessage =
    activeSource === AdvertisementSource.CRAWLER
      ? 'آگهی‌ای یافت نشد. یک کراول اجرا کنید تا داده‌ها اینجا نمایش داده شوند.'
      : 'هیچ آگهی‌ای توسط آژانس ثبت نشده است.';

  return (
    <div className="space-y-3 grow flex flex-col overflow-hidden">
      <div className="p-4 rounded-2xl bg-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.source}
                onClick={() => handleTabChange(tab.source)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeSource === tab.source
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="text-[12px] text-slate-400">{totalLabel}</div>
        </div>
        <AdsFilters
          filters={filters}
          onChange={patch}
          showTargetFilter={activeSource === AdvertisementSource.CRAWLER}
        />
      </div>

      <div className="grow overflow-auto">
        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage={emptyMessage}
          onRetry={refresh}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.items?.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onAddLead={
                  canManageLeads
                    ? () =>
                        setLeadAd({
                          id: ad.id,
                          title: ad.title ?? undefined,
                          agency: ad.agency,
                        })
                    : undefined
                }
              />
            ))}
          </div>
        </DataView>

        {data?.meta && data.meta.total > (filters.limit || 12) && (
          <div className="pt-6">
            <Pagination
              itemPerPage={filters.limit || 12}
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

      {leadAd && (
        <QuickLeadModal
          advertisementId={leadAd.id}
          listingTitle={leadAd.title}
          adAgency={leadAd.agency}
          isOpen={true}
          onClose={() => setLeadAd(null)}
        />
      )}
    </div>
  );
}

export default function CrawlerAdsPage() {
  return (
    <RoleProtectedRoute allowedRoles={RouteItems.crawlerAds.roles}>
      <DashbaordLayout>
        <Suspense fallback={null}>
          <AdsContent />
        </Suspense>
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
