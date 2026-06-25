'use client';

import { IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { PublicListing, RealEstateCategory } from './listings.types';

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

export function ListingCard({ listing }: { listing: PublicListing }) {
  const price =
    formatPrice(listing.totalPrice) ??
    (listing.deposit != null || listing.rent != null
      ? `${formatPrice(listing.deposit) ?? '۰'} ودیعه / ${formatPrice(listing.rent) ?? '۰'} اجاره`
      : undefined);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="rounded-2xl border border-slate-100 bg-white overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all"
    >
      {listing.images?.[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.images[0]}
          alt={listing.title ?? ''}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-48 w-full bg-slate-100" />
      )}
      <div className="p-4 flex flex-col gap-2 grow">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {CATEGORY_LABEL[listing.category]}
          </span>
        </div>

        <h3 className="font-semibold text-slate-700 leading-snug line-clamp-2">
          {listing.title ?? 'بدون عنوان'}
        </h3>

        {(listing.city || listing.district) && (
          <div className="flex items-center gap-1 text-[12px] text-slate-500">
            <IconMapPin size={13} className="text-slate-400" />
            {[listing.city?.nameFa, listing.district]
              .filter(Boolean)
              .join(' · ')}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
          {listing.area != null && (
            <span>{listing.area.toLocaleString('fa-IR')} متر</span>
          )}
          {listing.rooms != null && (
            <span>{listing.rooms.toLocaleString('fa-IR')} خواب</span>
          )}
        </div>

        {price && (
          <div className="font-bold text-slate-800 text-sm">{price}</div>
        )}
      </div>
    </Link>
  );
}
