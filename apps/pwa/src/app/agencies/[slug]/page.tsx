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
    if (data?.agency?.name) document.title = `${data.agency.name} | نوا ملک`;
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

          {/* Banner with agency identity overlaid */}
          <div className="relative">
            <div
              className="h-36 md:h-48 w-full bg-slate-800 bg-cover bg-center"
              style={{
                backgroundImage: data.agency.banner
                  ? `linear-gradient(to top, rgba(15,23,42,0.82) 40%, rgba(15,23,42,0.15)), url(${data.agency.banner})`
                  : 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              }}
            />
            {/* Name + address overlaid on banner bottom */}
            <div className="absolute inset-x-0 bottom-0 pb-3 px-4">
              <div className="container max-w-6xl mx-auto">
                <h1 className="font-black text-xl md:text-2xl text-white drop-shadow-sm leading-snug">
                  {data.agency.name}
                </h1>
                {(data.agency.city || data.agency.address) && (
                  <div className="flex items-center gap-1 text-xs text-white/75 mt-0.5">
                    <IconMapPin size={12} />
                    {[data.agency.city?.nameFa, data.agency.address].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Logo + CTAs row */}
            <div className="flex items-center gap-3 md:gap-4 -mt-7 mb-6">
              <div className="size-20 md:size-24 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {data.agency.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.agency.logo} alt={data.agency.name} className="h-full w-full object-cover" />
                ) : (
                  <IconBuildingCommunity size={32} className="text-slate-400" />
                )}
              </div>
              <div className="flex gap-2 flex-wrap mt-8">
                {data.agency.phone && (
                  <a
                    href={`tel:${data.agency.phone}`}
                    className="flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <IconPhone size={15} />
                    تماس با آژانس
                  </a>
                )}
                {data.agency.website && (
                  <a
                    href={data.agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <IconWorld size={15} className="text-slate-400" />
                    وب‌سایت
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            {data.agency.description && (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
                {data.agency.description}
              </p>
            )}

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
