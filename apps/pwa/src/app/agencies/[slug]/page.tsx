'use client';

import { ListingCard } from '@/app/listings/listings.component.card';
import { PublicListing } from '@/app/listings/listings.types';
import { RootLayout } from '@/components/layout/layout.component.root';
import { useSwrHelper } from '@/libs/api/api.hook.use-swr-helper';
import { fetcher } from '@/libs/api/api.util.fetcher';
import { City } from '@/libs/city/city.types';
import { DataView } from '@/ui/molecules';
import {
  IconBuildingCommunity,
  IconMapPin,
  IconPhone,
  IconWorld,
} from '@tabler/icons-react';
import { use, useEffect } from 'react';
import useSWR from 'swr';

interface AgencyProfile {
  agency: {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    phone?: string;
    logo?: string;
    banner?: string;
    website?: string;
    city?: City;
    address?: string;
  };
  listings: {
    items: PublicListing[];
    meta: { page: number; limit: number; total: number; pageCount: number };
  };
}

function SeoJsonLd({ agency }: { agency: AgencyProfile['agency'] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: agency.name,
    image: agency.banner || agency.logo || undefined,
    logo: agency.logo || undefined,
    telephone: agency.phone || undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    areaServed: agency.city?.nameFa || undefined,
    description: agency.description || undefined,
    address: agency.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: agency.address,
          addressLocality: agency.city?.nameFa,
        }
      : undefined,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function AgencyContent({ slug }: { slug: string }) {
  const swr = useSWR<AgencyProfile>(`/public/agencies/${slug}`, fetcher);
  const { data, error, isLoading, refresh } = useSwrHelper(swr);

  useEffect(() => {
    if (data?.agency?.name) document.title = `${data.agency.name} | نوا املاک`;
  }, [data]);

  return (
    <DataView
      data={data}
      error={error}
      isLoading={isLoading}
      isEmpty={(d) => !d?.agency}
      emptyMessage="این آژانس در دسترس نیست."
      onRetry={refresh}
    >
      {data && (
        <article>
          <SeoJsonLd agency={data.agency} />

          {/* Banner */}
          <div
            className="h-44 md:h-64 w-full bg-slate-200 bg-cover bg-center"
            style={{
              backgroundImage: data.agency.banner
                ? `linear-gradient(to top, rgba(15,23,42,0.45), rgba(15,23,42,0.05)), url(${data.agency.banner})`
                : 'linear-gradient(120deg, #1e3a8a, #0f172a)',
            }}
          />

          <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header card overlapping the banner */}
            <div className="-mt-12 mb-6 flex items-end gap-4">
              <div className="size-24 rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {data.agency.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.agency.logo} alt={data.agency.name} className="h-full w-full object-cover" />
                ) : (
                  <IconBuildingCommunity size={36} className="text-slate-400" />
                )}
              </div>
              <div className="pb-1">
                <h1 className="font-black text-2xl text-slate-800">{data.agency.name}</h1>
                {(data.agency.city || data.agency.address) && (
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                    <IconMapPin size={14} className="text-slate-400" />
                    {[data.agency.city?.nameFa, data.agency.address].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            </div>

            {/* Info + contact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-3">
                {data.agency.description && (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {data.agency.description}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2 h-fit">
                {data.agency.phone && (
                  <a
                    href={`tel:${data.agency.phone}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-2.5 font-medium hover:opacity-90"
                  >
                    <IconPhone size={16} />
                    تماس با آژانس
                  </a>
                )}
                {data.agency.website && (
                  <a
                    href={data.agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <IconWorld size={16} className="text-slate-400" />
                    وب‌سایت
                  </a>
                )}
              </div>
            </div>

            {/* Listings */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800">آگهی‌های این آژانس</h2>
              <span className="text-[12px] text-slate-400">
                {data.listings.meta.total.toLocaleString('fa-IR')} آگهی
              </span>
            </div>
            {data.listings.items.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                {data.listings.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center text-slate-500 mb-10">
                آگهی منتشرشده‌ای وجود ندارد.
              </div>
            )}
          </div>
        </article>
      )}
    </DataView>
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
