'use client';

import { RootLayout } from '@/components/layout/layout.component.root';
import { DataView, Pagination } from '@/ui/molecules';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { usePublicListings } from './listings.api';
import { ListingCard } from './listings.component.card';
import { ListingsFilters } from './listings.component.filters';
import { PublicListingFilters, RealEstateCategory } from './listings.types';

function ListingsContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<PublicListingFilters>({
    page: 0,
    limit: 12,
    q: searchParams.get('q') || undefined,
    citySlug: searchParams.get('city') || undefined,
    category: (searchParams.get('category') as RealEstateCategory) || undefined,
  });

  const { data, error, isLoading, refresh } = usePublicListings(filters);

  const patch = (p: Partial<PublicListingFilters>) =>
    setFilters((prev) => ({ ...prev, ...p }));

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="font-black text-2xl md:text-3xl text-slate-800">
          آگهی‌های ملک
        </h1>
        <p className="text-slate-500 text-sm">
          جدیدترین فایل‌های منتشرشده را ببینید و برای اطلاعات بیشتر تماس بگیرید.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 p-4">
        <ListingsFilters filters={filters} onChange={patch} />
      </div>

      <DataView
        data={data}
        error={error}
        isLoading={isLoading}
        isEmpty={(d) => !d?.items.length}
        emptyMessage="آگهی‌ای برای نمایش وجود ندارد."
        onRetry={refresh}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {data?.items?.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </DataView>

      {data?.meta && data.meta.total > (filters.limit || 12) && (
        <Pagination
          itemPerPage={filters.limit || 12}
          page={(filters.page || 0) + 1}
          totalCount={data.meta.total}
          onNavigate={(page) => {
            patch({ page: page - 1 });
            return '#';
          }}
        />
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <RootLayout>
      <Suspense fallback={null}>
        <ListingsContent />
      </Suspense>
    </RootLayout>
  );
}
