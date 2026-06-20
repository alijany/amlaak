'use client';

import { Advertisement, RealEstateCategory } from '../crawler.types';

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

export function AdCard({ ad }: { ad: Advertisement }) {
  const price =
    formatPrice(ad.totalPrice) ??
    (ad.deposit != null || ad.rent != null
      ? `${formatPrice(ad.deposit) ?? '۰'} ودیعه / ${formatPrice(ad.rent) ?? '۰'} اجاره`
      : undefined);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden flex flex-col">
      {ad.images?.[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.images[0]}
          alt={ad.title ?? ''}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-3 flex flex-col gap-2 grow">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {CATEGORY_LABEL[ad.category]}
          </span>
          <span className="text-[11px] text-slate-400">{ad.target?.name}</span>
        </div>

        <h3 className="font-semibold text-slate-700 text-sm leading-snug line-clamp-2">
          {ad.title ?? 'بدون عنوان'}
        </h3>

        <div className="text-[12px] text-slate-500">
          {[ad.city, ad.district].filter(Boolean).join(' · ')}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
          {ad.area != null && <span>{ad.area.toLocaleString('fa-IR')} متر</span>}
          {ad.rooms != null && <span>{ad.rooms.toLocaleString('fa-IR')} خواب</span>}
        </div>

        {price && <div className="font-bold text-slate-800 text-sm">{price}</div>}
      </div>
    </div>
  );
}
