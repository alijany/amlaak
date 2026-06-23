'use client';

import { usePublicListings } from '@/app/listings/listings.api';
import { ListingCard } from '@/app/listings/listings.component.card';
import { PublicListingFilters } from '@/app/listings/listings.types';
import { DataView } from '@/ui/molecules';
import { IconChevronLeft } from '@tabler/icons-react';
import Link from 'next/link';

interface LandingListingsStripProps {
  title: string;
  filters?: PublicListingFilters;
  viewAllHref?: string;
}

export function LandingListingsStrip({
  title,
  filters = { limit: 8 },
  viewAllHref = '/listings',
}: LandingListingsStripProps) {
  const { data, error, isLoading, refresh } = usePublicListings(filters);

  return (
    <section className="py-12 md:py-16 bg-slate-50">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-800">{title}</h2>
          <Link
            href={viewAllHref}
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            مشاهده همه
            <IconChevronLeft size={16} />
          </Link>
        </div>

        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage="هنوز آگهی‌ای برای نمایش وجود ندارد."
          onRetry={refresh}
          variant="inline"
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {data?.items?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </DataView>
      </div>
    </section>
  );
}
