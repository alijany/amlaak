'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { DataView, Pagination } from '@/ui/molecules';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { AdvertisementFilters } from '../crawler.types';
import { useAdvertisements } from './crawler.ads.api';
import { AdsFilters } from './crawler.ads.component.filters';
import { AdCard } from './crawler.ads.component.list';

function AdsContent() {
  const searchParams = useSearchParams();
  const initialTargetId = searchParams.get('targetId');

  const [filters, setFilters] = useState<AdvertisementFilters>({
    page: 0,
    limit: 12,
    targetId: initialTargetId ? Number(initialTargetId) : undefined,
  });

  const { data, error, isLoading, refresh } = useAdvertisements(filters);

  const patch = (p: Partial<AdvertisementFilters>) =>
    setFilters((prev) => ({ ...prev, ...p }));

  const totalLabel = useMemo(
    () => (data?.meta ? `${data.meta.total.toLocaleString('fa-IR')} آگهی` : ''),
    [data?.meta],
  );

  return (
    <div className="space-y-3 grow flex flex-col overflow-hidden">
      <div className="p-4 rounded-2xl bg-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-bold">آگهی‌های گردآوری‌شده</div>
          <div className="text-[12px] text-slate-400">{totalLabel}</div>
        </div>
        <AdsFilters filters={filters} onChange={patch} />
      </div>

      <div className="grow overflow-auto">
        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage="آگهی‌ای یافت نشد. یک کراول اجرا کنید تا داده‌ها اینجا نمایش داده شوند."
          onRetry={refresh}
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {data?.items?.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
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
