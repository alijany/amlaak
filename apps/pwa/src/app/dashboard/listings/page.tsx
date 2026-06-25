'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ApiError } from '@/libs/api/api.types.error';
import { Button } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { PublishStatusPill } from '@/app/dashboard/crawler/crawler.component.status-pill';
import {
  IconBed,
  IconBuildingEstate,
  IconCalendar,
  IconEdit,
  IconMapPin,
  IconPhoto,
  IconPlus,
  IconRuler2,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAgency } from '../agency/agency.api';
import { useDeleteListing, useMyListings } from './listings.api';
import { ListingFormModal } from './listings.component.form-modal';
import { QuickLeadModal } from './listings.component.lead-modal';
import { MyListing, RealEstateCategory } from './listings.types';

const CATEGORY_LABEL: Record<RealEstateCategory, string> = {
  [RealEstateCategory.SALE]: 'فروش',
  [RealEstateCategory.RENT]: 'رهن و اجاره',
  [RealEstateCategory.MORTGAGE]: 'رهن کامل',
  [RealEstateCategory.UNKNOWN]: 'نامشخص',
};

const fa = (n?: number) => (n == null ? undefined : n.toLocaleString('fa-IR'));
const toman = (n?: number) => (n == null ? undefined : `${fa(n)} تومان`);

/** Sale ads show a single price; rent ads show deposit + rent. */
function priceLabel(listing: MyListing): string {
  if (listing.totalPrice != null) return toman(listing.totalPrice)!;
  if (listing.deposit != null || listing.rent != null) {
    return `${toman(listing.deposit) ?? '۰'} ودیعه · ${toman(listing.rent) ?? '۰'} اجاره`;
  }
  return 'قیمت توافقی';
}

function ListingCard({
  listing,
  onEdit,
  onDeleted,
}: {
  listing: MyListing;
  onEdit: (l: MyListing) => void;
  onDeleted: () => void;
}) {
  const { submit: remove, isLoading } = useDeleteListing(listing.id);
  const [leadOpen, setLeadOpen] = useState(false);

  const onDelete = async () => {
    if (!confirm('این آگهی حذف شود؟')) return;
    try {
      await remove();
      toast.success('آگهی حذف شد');
      onDeleted();
    } catch (e) {
      toast.error((e as ApiError).message || 'حذف ناموفق بود');
    }
  };

  // The whole card links to the detail page; action buttons sit inside that
  // link, so they must swallow the click to avoid navigating. Rendered as
  // role="button" spans since <button> can't be nested inside an <a>.
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  const specs = [
    listing.area != null && {
      icon: <IconRuler2 size={14} className="text-slate-400" />,
      text: `${fa(listing.area)} متر`,
    },
    listing.rooms != null && {
      icon: <IconBed size={14} className="text-slate-400" />,
      text: `${fa(listing.rooms)} خواب`,
    },
    listing.yearBuilt != null && {
      icon: <IconCalendar size={14} className="text-slate-400" />,
      text: `ساخت ${fa(listing.yearBuilt)}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <>
      <Link
        href={`/dashboard/listings/${listing.id}`}
        className="group block rounded-2xl border border-slate-100 bg-white overflow-hidden flex flex-col sm:flex-row hover:border-slate-300 hover:shadow-md transition-all"
      >
        {/* Thumbnail */}
        <div className="relative sm:w-44 sm:flex-shrink-0 h-40 sm:h-auto bg-slate-100">
          {listing.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt={listing.title ?? ''}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-300">
              <IconPhoto size={32} stroke={1.5} />
            </div>
          )}
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">
            <IconBuildingEstate size={12} className="text-slate-400" />
            {CATEGORY_LABEL[listing.category]}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {listing.title ?? 'بدون عنوان'}
            </div>
            <PublishStatusPill status={listing.publishStatus} />
          </div>

          {(listing.city || listing.district) && (
            <div className="flex items-center gap-1 text-[12px] text-slate-500">
              <IconMapPin size={13} className="text-slate-400" />
              {[listing.city?.nameFa, listing.district]
                .filter(Boolean)
                .join(' · ')}
            </div>
          )}

          {specs.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
              {specs.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  {s.icon}
                  {s.text}
                </span>
              ))}
            </div>
          )}

          {/* Options — swallow clicks so they don't trigger card navigation */}
          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div className="font-bold text-slate-800 text-sm">
              {priceLabel(listing)}
            </div>
            <div className="flex items-center gap-1">
              <span
                role="button"
                tabIndex={0}
                onClick={stop(() => setLeadOpen(true))}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                title="افزودن مشتری"
              >
                <IconUserPlus size={17} />
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={stop(() => onEdit(listing))}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                title="ویرایش"
              >
                <IconEdit size={17} />
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-disabled={isLoading}
                onClick={stop(() => {
                  if (!isLoading) onDelete();
                })}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer aria-disabled:opacity-50 aria-disabled:pointer-events-none"
                title="حذف"
              >
                <IconTrash size={17} />
              </span>
            </div>
          </div>
        </div>
      </Link>

      <QuickLeadModal
        advertisementId={listing.id}
        listingTitle={listing.title}
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
      />
    </>
  );
}

function ListingsContent({ isConfirmed }: { isConfirmed: boolean }) {
  const { data, error, isLoading, refresh } = useMyListings();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MyListing | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (l: MyListing) => {
    setEditing(l);
    setModalOpen(true);
  };

  return (
    <div className="space-y-3 grow flex flex-col overflow-hidden">
      {!isConfirmed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
          آژانس شما در انتظار تأیید مدیر است. تا پیش از تأیید، امکان ثبت آگهی وجود ندارد.
        </div>
      )}
      <div className="p-4 rounded-2xl bg-white flex items-center justify-between">
        <div className="font-bold">آگهی‌های من</div>
        <Button size="sm" onClick={openCreate} disabled={!isConfirmed}>
          <IconPlus size={16} className="ml-1" />
          ثبت آگهی
        </Button>
      </div>

      <div className="grow overflow-auto">
        <DataView
          data={data}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage="هنوز آگهی‌ای ثبت نکرده‌اید. با «ثبت آگهی» شروع کنید."
          onRetry={refresh}
          className="space-y-3"
        >
          {data?.items?.map((l) => (
            <ListingCard key={l.id} listing={l} onEdit={openEdit} onDeleted={refresh} />
          ))}
        </DataView>
      </div>

      <ListingFormModal
        isOpen={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}

export default function ListingsPage() {
  const { selectedRole } = useAuth();
  const agencyId = selectedRole?.agency?.id;
  const { data: agency } = useAgency(agencyId);
  const isConfirmed = agency ? agency.isConfirmed !== false : true;

  return (
    <RoleProtectedRoute allowedRoles={[Role.MEMBER, Role.MANAGER, Role.OWNER, Role.ADMIN]}>
      <DashbaordLayout>
        {agencyId != null ? (
          <ListingsContent isConfirmed={isConfirmed} />
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
            برای ثبت آگهی، ابتدا یک آژانس بسازید یا انتخاب کنید.
          </div>
        )}
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
