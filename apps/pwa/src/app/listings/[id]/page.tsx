'use client';

import { brand } from '@/config/brand.config';
import { RootLayout } from '@/components/layout/layout.component.root';
import { DataView } from '@/ui/molecules';
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconPhone,
} from '@tabler/icons-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { usePublicListing } from '../listings.api';
import { PublicListing, RealEstateCategory } from '../listings.types';

const CATEGORY_LABEL: Record<RealEstateCategory, string> = {
  [RealEstateCategory.SALE]: 'فروش',
  [RealEstateCategory.RENT]: 'رهن و اجاره',
  [RealEstateCategory.MORTGAGE]: 'رهن کامل',
  [RealEstateCategory.UNKNOWN]: 'نامشخص',
};

function formatPrice(value?: number): string | undefined {
  if (value == null) return undefined;
  return `${value.toLocaleString('fa-IR')} تومان`;
}

function Gallery({ images, title }: { images: string[]; title?: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) {
    return <div className="h-72 w-full rounded-2xl bg-slate-100" />;
  }
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-100 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[idx]}
        alt={title ?? ''}
        className="w-full h-72 md:h-96 object-cover"
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 disabled:opacity-0 text-white rounded-full p-1.5 hover:bg-black/60"
          >
            <IconChevronRight size={18} />
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
            disabled={idx === images.length - 1}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 disabled:opacity-0 text-white rounded-full p-1.5 hover:bg-black/60"
          >
            <IconChevronLeft size={18} />
          </button>
          <span className="absolute top-3 left-3 bg-black/40 text-white text-[11px] px-2 py-0.5 rounded-full">
            {(idx + 1).toLocaleString('fa-IR')} /{' '}
            {images.length.toLocaleString('fa-IR')}
          </span>
        </>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-[11px] text-slate-400 mb-0.5">{label}</div>
      <div className="font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function ListingView({ listing }: { listing: PublicListing }) {
  const specs: { label: string; value: string }[] = [
    ...(listing.area != null
      ? [{ label: 'متراژ', value: `${listing.area.toLocaleString('fa-IR')} م²` }]
      : []),
    ...(listing.rooms != null
      ? [{ label: 'اتاق', value: listing.rooms.toLocaleString('fa-IR') }]
      : []),
    ...(listing.yearBuilt != null
      ? [{ label: 'سال ساخت', value: listing.yearBuilt.toLocaleString('fa-IR') }]
      : []),
    ...(listing.floor != null
      ? [{ label: 'طبقه', value: listing.floor.toLocaleString('fa-IR') }]
      : []),
  ];

  const amenities = Array.isArray(listing.attributes?.amenities)
    ? (listing.attributes!.amenities as string[])
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <Gallery images={listing.images ?? []} title={listing.title} />

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-600">
            {CATEGORY_LABEL[listing.category]}
          </span>
          {(listing.city || listing.district) && (
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <IconMapPin size={14} className="text-slate-400" />
              {[listing.province, listing.city, listing.district]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </div>

        <h1 className="font-black text-xl md:text-2xl text-slate-800">
          {listing.title ?? 'آگهی ملک'}
        </h1>

        {specs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {specs.map((s) => (
              <Spec key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        )}

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <span
                key={a}
                className="text-[12px] bg-blue-50 text-blue-700 rounded-full px-3 py-1"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {listing.description && (
          <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
            {listing.description}
          </p>
        )}
      </div>

      {/* Sidebar: price + contact CTA */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2.5 lg:sticky lg:top-24">
          {listing.totalPrice != null && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">قیمت کل</span>
              <span className="font-bold text-slate-800">
                {formatPrice(listing.totalPrice)}
              </span>
            </div>
          )}
          {listing.pricePerMeter != null && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">قیمت هر متر</span>
              <span className="font-bold text-slate-700">
                {formatPrice(listing.pricePerMeter)}
              </span>
            </div>
          )}
          {listing.deposit != null && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ودیعه</span>
              <span className="font-bold text-slate-700">
                {formatPrice(listing.deposit)}
              </span>
            </div>
          )}
          {listing.rent != null && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">اجاره ماهیانه</span>
              <span className="font-bold text-slate-700">
                {formatPrice(listing.rent)}
              </span>
            </div>
          )}

          <a
            href={`tel:${brand.contact.phone.primary}`}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-3 font-medium hover:opacity-90 transition-opacity"
          >
            <IconPhone size={18} />
            تماس برای این ملک
          </a>
          <div className="text-center text-[11px] text-slate-400">
            هنگام تماس کد رهگیری{' '}
            <span className="font-mono text-slate-500">{listing.trackingCode}</span>{' '}
            را اعلام کنید.
          </div>
        </div>
      </div>
    </div>
  );
}

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
        {data && <ListingView listing={data} />}
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
