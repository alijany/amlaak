'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { JsonViewer } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import {
  IconArrowRight,
  IconBuildingEstate,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconMapPin,
  IconPhone,
} from '@tabler/icons-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { Advertisement, RealEstateCategory } from '../../crawler.types';
import { useAdvertisement } from './crawler.ads.detail.api';

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

// ── Structured view ───────────────────────────────────────────────────────────

function ImageGallery({ images, title }: { images: string[]; title?: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-100 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[idx]}
        alt={title ?? ''}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 disabled:opacity-0 text-white rounded-full p-1.5 hover:bg-black/60 transition-opacity"
          >
            <IconChevronRight size={18} />
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
            disabled={idx === images.length - 1}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 disabled:opacity-0 text-white rounded-full p-1.5 hover:bg-black/60 transition-opacity"
          >
            <IconChevronLeft size={18} />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === idx ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
          <span className="absolute top-3 left-3 bg-black/40 text-white text-[11px] px-2 py-0.5 rounded-full">
            {(idx + 1).toLocaleString('fa-IR')} /{' '}
            {images.length.toLocaleString('fa-IR')}
          </span>
        </>
      )}
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-[11px] text-slate-400 mb-0.5">{label}</div>
      <div className="font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}

function StructuredView({ ad }: { ad: Advertisement }) {
  const attrs = ad.attributes ?? {};
  const amenities = Array.isArray(attrs.amenities)
    ? (attrs.amenities as string[])
    : [];
  const phone = typeof attrs.phone === 'string' ? attrs.phone : undefined;
  const landArea =
    typeof attrs.landArea === 'string' ? attrs.landArea : undefined;
  const buildingAge =
    typeof attrs.buildingAge === 'string' ? attrs.buildingAge : undefined;
  const documentType =
    typeof attrs.documentType === 'string' ? attrs.documentType : undefined;
  const street = typeof attrs.street === 'string' ? attrs.street : undefined;
  const isAgency = attrs.isAgency === true;
  const agencyName =
    typeof attrs.agencyName === 'string' ? attrs.agencyName : undefined;
  const agencyProfileUrl =
    typeof attrs.agencyProfileUrl === 'string'
      ? attrs.agencyProfileUrl
      : undefined;

  const specs: { label: string; value: string | number }[] = [
    ...(ad.area != null
      ? [{ label: 'متراژ', value: `${ad.area.toLocaleString('fa-IR')} م²` }]
      : []),
    ...(ad.rooms != null
      ? [{ label: 'اتاق', value: ad.rooms.toLocaleString('fa-IR') }]
      : []),
    ...(ad.yearBuilt != null
      ? [{ label: 'سال ساخت', value: ad.yearBuilt.toLocaleString('fa-IR') }]
      : []),
    ...(ad.floor != null
      ? [{ label: 'طبقه', value: ad.floor.toLocaleString('fa-IR') }]
      : []),
    ...(landArea ? [{ label: 'متراژ زمین', value: landArea }] : []),
    ...(buildingAge ? [{ label: 'عمر بنا', value: buildingAge }] : []),
  ];

  const extraAttrs: { label: string; value: string }[] = [
    ...(documentType ? [{ label: 'وضعیت سند', value: documentType }] : []),
    ...(typeof attrs.cabinetCondition === 'string'
      ? [{ label: 'کابینت', value: attrs.cabinetCondition }]
      : []),
    ...(typeof attrs.floorCondition === 'string'
      ? [{ label: 'کف', value: attrs.floorCondition }]
      : []),
    ...(typeof attrs.facadeCondition === 'string'
      ? [{ label: 'نما', value: attrs.facadeCondition }]
      : []),
  ];

  const hasPrices =
    ad.totalPrice != null ||
    ad.pricePerMeter != null ||
    ad.deposit != null ||
    ad.rent != null;

  return (
    <div className="space-y-5">
      {/* Gallery */}
      <ImageGallery images={ad.images ?? []} title={ad.title} />

      {/* Location */}
      {(ad.province || ad.city || ad.district || street) && (
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <IconMapPin size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            {[ad.province, ad.city, ad.district].filter(Boolean).join(' · ')}
            {street && (
              <span className="text-slate-400"> · {street}</span>
            )}
          </span>
        </div>
      )}

      {/* Agency */}
      {isAgency && agencyName && (
        <a
          href={agencyProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 text-amber-800 font-bold text-sm">
            {agencyName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-700 text-sm truncate">
              {agencyName}
            </div>
            <div className="text-[11px] text-amber-700">آژانس املاک</div>
          </div>
          <IconExternalLink size={14} className="text-amber-400 mr-auto flex-shrink-0" />
        </a>
      )}

      {/* Phone */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2.5 rounded-xl bg-green-50 px-4 py-3 hover:bg-green-100 transition-colors"
        >
          <IconPhone size={16} className="text-green-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-green-700 tracking-wide dir-ltr">
            {phone}
          </span>
        </a>
      )}

      {/* Prices */}
      {hasPrices && (
        <div className="rounded-xl bg-slate-50 p-4 space-y-2.5">
          {ad.totalPrice != null && (
            <PriceRow label="قیمت کل" value={formatPrice(ad.totalPrice)!} />
          )}
          {ad.pricePerMeter != null && (
            <PriceRow
              label="قیمت هر متر"
              value={formatPrice(ad.pricePerMeter)!}
            />
          )}
          {ad.deposit != null && (
            <PriceRow label="ودیعه" value={formatPrice(ad.deposit)!} />
          )}
          {ad.rent != null && (
            <PriceRow label="اجاره ماهیانه" value={formatPrice(ad.rent)!} />
          )}
        </div>
      )}

      {/* Specs */}
      {specs.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {specs.map((s) => (
            <SpecCell key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      {/* Extra attributes */}
      {extraAttrs.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {extraAttrs.map((a) => (
            <div
              key={a.label}
              className="rounded-xl bg-slate-50 px-3 py-2.5 flex justify-between items-center text-sm"
            >
              <span className="text-slate-500">{a.label}</span>
              <span className="font-medium text-slate-700">{a.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            ویژگی‌ها و امکانات
          </div>
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
        </div>
      )}

      {/* Description */}
      {ad.description && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            توضیحات
          </div>
          <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
            {ad.description}
          </p>
        </div>
      )}

      {/* Footer meta */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex flex-col gap-0.5">
          {ad.crawledAt && (
            <span>
              گردآوری:{' '}
              {new Date(ad.crawledAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
          {ad.postedAt && (
            <span>
              انتشار:{' '}
              {new Date(ad.postedAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
        {ad.sourceUrl && (
          <a
            href={ad.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 hover:underline flex-shrink-0"
          >
            <IconExternalLink size={13} />
            مشاهده آگهی اصلی
          </a>
        )}
      </div>
    </div>
  );
}

// ── Debug / raw view ──────────────────────────────────────────────────────────

function DebugView({ ad }: { ad: Advertisement }) {
  return (
    <div className="space-y-4" dir='ltr'>
      <JsonViewer data={ad.attributes} title="attributes" />
      <JsonViewer data={ad.rawPayload} title="rawPayload" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'info' | 'debug';

function AdDetailContent({ id }: { id: number }) {
  const { data: ad, error, isLoading, refresh } = useAdvertisement(id);
  const [tab, setTab] = useState<Tab>('info');

  return (
    <div className="flex flex-col grow overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/crawler/ads"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm flex-shrink-0 transition-colors"
          >
            <IconArrowRight size={16} />
            بازگشت
          </Link>
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
          {ad && (
            <div className="min-w-0">
              <h1 className="font-bold text-slate-700 truncate">
                {ad.title ?? 'آگهی بدون عنوان'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {CATEGORY_LABEL[ad.category]}
                </span>
                {typeof ad.attributes?.propertySubtype === 'string' && (
                  <span className="text-[11px] text-slate-500 bg-blue-50 rounded-full px-2 py-0.5">
                    {ad.attributes.propertySubtype}
                  </span>
                )}
                {ad.target?.name && (
                  <span className="text-[11px] text-slate-400">
                    {ad.target.name}
                  </span>
                )}
              </div>
            </div>
          )}
          {isLoading && !ad && (
            <div className="h-5 w-48 bg-slate-100 rounded-lg animate-pulse" />
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 flex-shrink-0">
          <button
            onClick={() => setTab('info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              tab === 'info'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <IconBuildingEstate size={14} />
            اطلاعات ملک
          </button>
          <button
            onClick={() => setTab('debug')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              tab === 'debug'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="font-mono text-[11px]">{'{}'}</span>
            داده‌های خام
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="grow overflow-auto">
        <DataView
          data={ad}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d}
          emptyMessage="آگهی یافت نشد."
          onRetry={refresh}
        >
          {ad && (
            <div className="max-w-2xl mx-auto">
              {tab === 'info' && <StructuredView ad={ad} />}
              {tab === 'debug' && <DebugView ad={ad} />}
            </div>
          )}
        </DataView>
      </div>
    </div>
  );
}

export default function AdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const numId = Number(id);

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.crawlerAds.roles}>
      <DashbaordLayout>
        <AdDetailContent id={numId} />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
