'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { PublishStatusPill } from '@/app/dashboard/crawler/crawler.component.status-pill';
import {
  CATEGORY_LABEL,
  formatPrice,
  ListingDetailView,
} from '@/app/listings/listings.component.detail-view';
import { PublicListing } from '@/app/listings/listings.types';
import { ApiError } from '@/libs/api/api.types.error';
import { trackingCode } from '@/libs/lead/lead.util.tracking';
import { Button } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import {
  IconArrowRight,
  IconEdit,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'react-toastify';
import { useDeleteListing, useListing } from '../listings.api';
import { ListingFormModal } from '../listings.component.form-modal';
import { QuickLeadModal } from '../listings.component.lead-modal';
import { MyListing } from '../listings.types';

const WORKER = [Role.MEMBER, Role.MANAGER, Role.OWNER, Role.ADMIN];

/** Map an owned listing into the public visitor shape for the preview tab. */
function toPreview(
  listing: MyListing,
  agency?: { id: number; name: string; slug?: string },
): PublicListing {
  return {
    id: listing.id,
    trackingCode: trackingCode(listing.id),
    title: listing.title,
    description: listing.description,
    category: listing.category,
    totalPrice: listing.totalPrice,
    deposit: listing.deposit,
    rent: listing.rent,
    pricePerMeter: listing.pricePerMeter,
    area: listing.area,
    rooms: listing.rooms,
    yearBuilt: listing.yearBuilt,
    floor: listing.floor,
    province: listing.province,
    city: listing.city,
    district: listing.district,
    images: listing.images,
    attributes: listing.attributes,
    agency: agency ? { id: agency.id, name: agency.name, slug: agency.slug } : undefined,
  };
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function ManageView({ listing }: { listing: MyListing }) {
  const subtype =
    typeof listing.attributes?.propertySubtype === 'string'
      ? (listing.attributes.propertySubtype as string)
      : undefined;
  const created = listing.created_at
    ? new Date(listing.created_at).toLocaleDateString('fa-IR')
    : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="font-bold text-slate-700 mb-2">مشخصات</div>
        <Row label="نوع معامله" value={CATEGORY_LABEL[listing.category]} />
        <Row label="نوع ملک" value={subtype} />
        <Row label="متراژ" value={listing.area != null ? `${listing.area.toLocaleString('fa-IR')} م²` : undefined} />
        <Row label="تعداد خواب" value={listing.rooms != null ? listing.rooms.toLocaleString('fa-IR') : undefined} />
        <Row label="سال ساخت" value={listing.yearBuilt != null ? listing.yearBuilt.toLocaleString('fa-IR') : undefined} />
        <Row label="طبقه" value={listing.floor != null ? listing.floor.toLocaleString('fa-IR') : undefined} />
        <Row
          label="موقعیت"
          value={[listing.province, listing.city, listing.district].filter(Boolean).join(' · ') || undefined}
        />
        <Row label="تاریخ ثبت" value={created} />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="font-bold text-slate-700 mb-2">قیمت</div>
        <Row label="قیمت کل" value={formatPrice(listing.totalPrice)} />
        <Row label="قیمت هر متر" value={formatPrice(listing.pricePerMeter)} />
        <Row label="ودیعه" value={formatPrice(listing.deposit)} />
        <Row label="اجاره ماهیانه" value={formatPrice(listing.rent)} />
      </div>

      {listing.description && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 md:col-span-2">
          <div className="font-bold text-slate-700 mb-2">توضیحات</div>
          <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
            {listing.description}
          </p>
        </div>
      )}
    </div>
  );
}

function ListingDetailContent({ id }: { id: number }) {
  const { selectedRole } = useAuth();
  const router = useRouter();
  const { data, error, isLoading, refresh } = useListing(id);
  const { submit: remove, isLoading: deleting } = useDeleteListing(id);

  const [tab, setTab] = useState<'manage' | 'preview'>('manage');
  const [editOpen, setEditOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  const onDelete = async () => {
    try {
      await remove();
      toast.success('آگهی حذف شد');
      router.push('/dashboard/listings');
    } catch (e) {
      toast.error((e as ApiError).message || 'حذف ناموفق بود');
    }
  };

  return (
    <div className="space-y-4 grow flex flex-col overflow-auto">
      <Link
        href="/dashboard/listings"
        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm"
      >
        <IconArrowRight size={16} />
        بازگشت به آگهی‌های من
      </Link>

      <DataView
        data={data}
        error={error}
        isLoading={isLoading}
        isEmpty={(d) => !d}
        emptyMessage="این آگهی یافت نشد."
        onRetry={refresh}
      >
        {data && (
          <div className="space-y-4">
            {/* Header */}
            <div className="rounded-2xl bg-white p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-800 text-lg truncate">
                    {data.title ?? 'بدون عنوان'}
                  </h1>
                  <PublishStatusPill status={data.publishStatus} />
                </div>
                <div className="text-[12px] text-slate-400 mt-0.5">
                  کد رهگیری:{' '}
                  <span className="font-mono text-slate-500">{trackingCode(data.id)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="secondary" onClick={() => setLeadOpen(true)}>
                  <IconUserPlus size={16} className="ml-1" />
                  افزودن سرنخ
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  <IconEdit size={16} className="ml-1" />
                  ویرایش
                </Button>
                <Button size="sm" variant="outline" disabled={deleting} onClick={onDelete}>
                  <IconTrash size={16} className="ml-1" />
                  حذف
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 w-fit">
              <button
                onClick={() => setTab('manage')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'manage' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                جزئیات
              </button>
              <button
                onClick={() => setTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                پیش‌نمایش عمومی
              </button>
            </div>

            {tab === 'manage' ? (
              <ManageView listing={data} />
            ) : (
              <div className="rounded-2xl bg-white p-4">
                <ListingDetailView listing={toPreview(data, selectedRole?.agency ?? undefined)} />
              </div>
            )}

            <ListingFormModal
              isOpen={editOpen}
              editing={data}
              onClose={() => setEditOpen(false)}
              onSaved={refresh}
            />
            <QuickLeadModal
              advertisementId={data.id}
              listingTitle={data.title}
              isOpen={leadOpen}
              onClose={() => setLeadOpen(false)}
            />
          </div>
        )}
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
    <RoleProtectedRoute allowedRoles={WORKER}>
      <DashbaordLayout>
        <ListingDetailContent id={Number(id)} />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
