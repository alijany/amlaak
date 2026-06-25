'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ApiError } from '@/libs/api/api.types.error';
import { Button } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { PublishStatusPill } from '@/app/dashboard/crawler/crawler.component.status-pill';
import { IconEdit, IconPlus, IconTrash, IconUserPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAgency } from '../agency/agency.api';
import { useDeleteListing, useMyListings } from './listings.api';
import { ListingFormModal } from './listings.component.form-modal';
import { QuickLeadModal } from './listings.component.lead-modal';
import { MyListing } from './listings.types';

function ListingRow({
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
    try {
      await remove();
      toast.success('آگهی حذف شد');
      onDeleted();
    } catch (e) {
      toast.error((e as ApiError).message || 'حذف ناموفق بود');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between gap-3">
      <Link href={`/dashboard/listings/${listing.id}`} className="min-w-0 group">
        <div className="font-semibold text-slate-700 truncate group-hover:text-primary transition-colors">
          {listing.title ?? 'بدون عنوان'}
        </div>
        <div className="text-[12px] text-slate-400">
          {[listing.city?.nameFa, listing.district].filter(Boolean).join(' · ')}
          {listing.totalPrice != null &&
            ` · ${listing.totalPrice.toLocaleString('fa-IR')} تومان`}
        </div>
      </Link>
      <div className="flex items-center gap-2 flex-shrink-0">
        <PublishStatusPill status={listing.publishStatus} />
        <button
          onClick={() => setLeadOpen(true)}
          className="text-slate-400 hover:text-emerald-600 p-1.5"
          title="افزودن مشتری"
        >
          <IconUserPlus size={16} />
        </button>
        <button onClick={() => onEdit(listing)} className="text-slate-400 hover:text-slate-700 p-1.5" title="ویرایش">
          <IconEdit size={16} />
        </button>
        <button onClick={onDelete} disabled={isLoading} className="text-slate-400 hover:text-rose-500 p-1.5" title="حذف">
          <IconTrash size={16} />
        </button>
      </div>
      <QuickLeadModal
        advertisementId={listing.id}
        listingTitle={listing.title}
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
      />
    </div>
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
            <ListingRow key={l.id} listing={l} onEdit={openEdit} onDeleted={refresh} />
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
