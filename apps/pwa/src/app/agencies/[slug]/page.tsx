'use client';

import { ListingCard } from '@/app/listings/listings.component.card';
import { PublicListing } from '@/app/listings/listings.types';
import { RootLayout } from '@/components/layout/layout.component.root';
import { useSwrHelper } from '@/libs/api/api.hook.use-swr-helper';
import { fetcher } from '@/libs/api/api.util.fetcher';
import { DataView } from '@/ui/molecules';
import { IconBuildingCommunity, IconPhone } from '@tabler/icons-react';
import { use } from 'react';
import useSWR from 'swr';

interface AgencyProfile {
  agency: {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    phone?: string;
    logo?: string;
  };
  listings: {
    items: PublicListing[];
    meta: { page: number; limit: number; total: number; pageCount: number };
  };
}

function AgencyContent({ slug }: { slug: string }) {
  const swr = useSWR<AgencyProfile>(`/public/agencies/${slug}`, fetcher);
  const { data, error, isLoading, refresh } = useSwrHelper(swr);

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-6">
      <DataView
        data={data}
        error={error}
        isLoading={isLoading}
        isEmpty={(d) => !d?.agency}
        emptyMessage="این آژانس در دسترس نیست."
        onRetry={refresh}
      >
        {data && (
          <>
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                <IconBuildingCommunity size={28} />
              </div>
              <div>
                <h1 className="font-black text-2xl text-slate-800">
                  {data.agency.name}
                </h1>
                {data.agency.description && (
                  <p className="text-slate-500 text-sm mt-0.5">
                    {data.agency.description}
                  </p>
                )}
                {data.agency.phone && (
                  <a
                    href={`tel:${data.agency.phone}`}
                    className="inline-flex items-center gap-1.5 text-green-600 text-sm mt-1 dir-ltr"
                  >
                    <IconPhone size={14} />
                    {data.agency.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="text-sm font-bold text-slate-700">
              آگهی‌های این آژانس
            </div>
            {data.listings.items.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.listings.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center text-slate-500">
                آگهی منتشرشده‌ای وجود ندارد.
              </div>
            )}
          </>
        )}
      </DataView>
    </div>
  );
}

export default function AgencyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <RootLayout>
      <AgencyContent slug={slug} />
    </RootLayout>
  );
}
