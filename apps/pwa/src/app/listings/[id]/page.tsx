'use client';

import { RootLayout } from '@/components/layout/layout.component.root';
import { DataView } from '@/ui/molecules';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { use } from 'react';
import { ListingDetailView } from '../listings.component.detail-view';
import { usePublicListing } from '../listings.api';

function ListingDetailContent({ id }: { id: number }) {
  const { data, error, isLoading, refresh } = usePublicListing(id);

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-4">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm"
      >
        <IconArrowRight size={16} />
        بازگشت به آگهی‌ها
      </Link>

      <DataView
        data={data}
        error={error}
        isLoading={isLoading}
        isEmpty={(d) => !d}
        emptyMessage="این آگهی در دسترس نیست."
        onRetry={refresh}
      >
        {data && <ListingDetailView listing={data} />}
      </DataView>
    </div>
  );
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RootLayout>
      <ListingDetailContent id={Number(id)} />
    </RootLayout>
  );
}
