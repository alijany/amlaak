'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { getRoleName, Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ImageUploader } from '@/components/upload/upload.component.image';
import { ApiError } from '@/libs/api/api.types.error';
import { Button, Input } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { IconArrowRight, IconPlus, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useAgency,
  useAgencyMembers,
  useRemoveMember,
  useUpdateAgency,
} from '../../agency/agency.api';
import { InviteMemberModal } from '../../agency/agency.component.invite-modal';
import { AgencyMember } from '../../agency/agency.types';
import {
  useConfirmAgency,
  useReactivateAgency,
  useRejectAgency,
} from '../agencies.api';

function memberName(m: AgencyMember): string {
  const full = `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`.trim();
  return full || m.user?.phone || '—';
}

function AgencyAdminContent({ agencyId }: { agencyId: number }) {
  const { user } = useAuth();
  const { data: agency, error, isLoading, refresh } = useAgency(agencyId);
  const members = useAgencyMembers(agencyId);
  const { submit: update, isLoading: saving } = useUpdateAgency(agencyId);
  const { submit: removeMember } = useRemoveMember(agencyId);

  const { submit: confirm, isLoading: confirming } = useConfirmAgency();
  const { submit: reject, isLoading: rejecting } = useRejectAgency();
  const { submit: reactivate, isLoading: reactivating } = useReactivateAgency();
  const statusBusy = confirming || rejecting || reactivating;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState<string[]>([]);
  const [banner, setBanner] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (agency) {
      setName(agency.name ?? '');
      setPhone(agency.phone ?? '');
      setDescription(agency.description ?? '');
      setWebsite(agency.website ?? '');
      setCity(agency.city ?? '');
      setAddress(agency.address ?? '');
      setLogo(agency.logo ? [agency.logo] : []);
      setBanner(agency.banner ? [agency.banner] : []);
    }
  }, [agency]);

  const onSave = async () => {
    try {
      await update({
        name,
        phone: phone || undefined,
        description: description || undefined,
        website: website || undefined,
        city: city || undefined,
        address: address || undefined,
        logo: logo[0] ?? '',
        banner: banner[0] ?? '',
      });
      toast.success('اطلاعات آژانس ذخیره شد');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'ذخیره ناموفق بود');
    }
  };

  const onRemove = async (roleId: number) => {
    try {
      await removeMember(roleId);
      toast.success('عضو حذف شد');
      members.refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'حذف ناموفق بود');
    }
  };

  const onStatusAction = async (
    action: () => Promise<unknown>,
    okMessage: string,
  ) => {
    try {
      await action();
      toast.success(okMessage);
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'عملیات ناموفق بود');
    }
  };

  return (
    <div className="space-y-4 grow flex flex-col overflow-auto">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/agencies"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <IconArrowRight size={16} />
          بازگشت به فهرست آژانس‌ها
        </Link>
      </div>

      {/* Status / admin actions */}
      <DataView
        data={agency}
        error={error}
        isLoading={isLoading}
        onRetry={refresh}
        variant="inline"
      >
        {agency && (
          <div className="rounded-2xl bg-white p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-slate-600">
              وضعیت:{' '}
              {!agency.isActive
                ? 'غیرفعال'
                : agency.isConfirmed
                  ? 'تأیید‌شده'
                  : 'در انتظار تأیید'}
            </div>
            <div className="flex gap-2 flex-wrap">
              {agency.isActive && !agency.isConfirmed && (
                <>
                  <Button
                    size="sm"
                    disabled={statusBusy}
                    onClick={() =>
                      onStatusAction(() => confirm(agencyId), 'آژانس تأیید شد')
                    }
                  >
                    تأیید آژانس
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={statusBusy}
                    onClick={() =>
                      onStatusAction(() => reject(agencyId), 'آژانس رد شد')
                    }
                  >
                    رد آژانس
                  </Button>
                </>
              )}
              {agency.isActive && agency.isConfirmed && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={statusBusy}
                  onClick={() =>
                    onStatusAction(() => reject(agencyId), 'آژانس غیرفعال شد')
                  }
                >
                  غیرفعال‌سازی
                </Button>
              )}
              {!agency.isActive && (
                <Button
                  size="sm"
                  disabled={statusBusy}
                  onClick={() =>
                    onStatusAction(
                      () => reactivate(agencyId),
                      'آژانس فعال شد',
                    )
                  }
                >
                  فعال‌سازی
                </Button>
              )}
            </div>
          </div>
        )}
      </DataView>

      {/* Profile */}
      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div className="font-bold text-slate-700">اطلاعات آژانس</div>
        <DataView
          data={agency}
          error={error}
          isLoading={isLoading}
          onRetry={refresh}
          variant="inline"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="نام آژانس" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="تلفن" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="وب‌سایت" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <Input label="شهر" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <Input label="آدرس" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input
              label="درباره آژانس"
              textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ImageUploader label="لوگو" value={logo} onChange={setLogo} max={1} previewClassName="h-20 w-20 rounded-full" />
              <ImageUploader label="بنر" value={banner} onChange={setBanner} max={1} previewClassName="h-20 w-full" />
            </div>
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving}>
                ذخیره
              </Button>
            </div>
          </div>
        </DataView>
      </div>

      {/* Members */}
      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-700">اعضا</div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <IconPlus size={16} className="ml-1" />
            افزودن کاربر جدید
          </Button>
        </div>
        <DataView
          data={members.data}
          error={members.error}
          isLoading={members.isLoading}
          isEmpty={(d) => !d?.items.length}
          emptyMessage="هنوز عضوی اضافه نشده است."
          onRetry={members.refresh}
          variant="inline"
          className="divide-y divide-slate-100"
        >
          {members.data?.items?.map((m) => {
            const isProtected = m.role === Role.OWNER || m.user?.id === user?.id;
            return (
              <div key={m.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">
                    {memberName(m)}
                  </div>
                  <div className="text-[12px] text-slate-400">
                    {getRoleName(m.role)} · {m.invitationStatus}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(m.id)}
                  disabled={isProtected}
                  className={isProtected
                    ? 'text-slate-200 cursor-not-allowed p-1.5'
                    : 'text-slate-400 hover:text-rose-500 p-1.5'}
                  title={isProtected ? undefined : 'حذف'}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            );
          })}
        </DataView>
      </div>

      <InviteMemberModal
        agencyId={agencyId}
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={members.refresh}
      />
    </div>
  );
}

export default function AgencyAdminDetailPage() {
  const params = useParams<{ id: string }>();
  const agencyId = Number(params?.id);

  return (
    <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
      <DashbaordLayout>
        {Number.isFinite(agencyId) && agencyId > 0 ? (
          <AgencyAdminContent agencyId={agencyId} />
        ) : (
          <div className="rounded-2xl bg-white p-6 text-slate-500">
            آژانس نامعتبر است.
          </div>
        )}
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
