'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { getRoleName, Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ImageUploader } from '@/components/upload/upload.component.image';
import { ApiError } from '@/libs/api/api.types.error';
import { CitySelect } from '@/libs/city/city.component.select';
import { City } from '@/libs/city/city.types';
import { Button, Input } from '@/ui/atoms';
import { DataView } from '@/ui/molecules';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useAgency,
  useAgencyMembers,
  useCreateAgency,
  useRemoveMember,
  useUpdateAgency,
} from './agency.api';
import { InviteMemberModal } from './agency.component.invite-modal';
import { AgencyMember } from './agency.types';

/** Onboarding: register a new agency (caller becomes its OWNER). */
function CreateAgency() {
  const { refreshProfile } = useAuth();
  const { submit, isLoading } = useCreateAgency();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState<string[]>([]);
  const [banner, setBanner] = useState<string[]>([]);

  const onCreate = async () => {
    if (!name.trim()) return;
    try {
      await submit({
        name: name.trim(),
        phone: phone || undefined,
        website: website || undefined,
        cityId: city?.id,
        address: address || undefined,
        logo: logo[0],
        banner: banner[0],
      });
      toast.success('آژانس ساخته شد. از منوی نقش‌ها آن را انتخاب کنید.');
      refreshProfile();
    } catch (e) {
      toast.error((e as ApiError).message || 'ساخت آژانس ناموفق بود');
    }
  };

  return (
    <div className="max-w-lg mx-auto rounded-2xl bg-white p-6 space-y-4 overflow-auto">
      <div className="font-bold text-slate-700">ساخت آژانس جدید</div>
      <p className="text-[13px] text-slate-500">
        با ساخت آژانس، می‌توانید آگهی ثبت کنید، اعضا را دعوت کنید و مشتری‌ها را مدیریت کنید.
      </p>
      <Input label="نام آژانس" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="تلفن" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="وب‌سایت" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <CitySelect value={city} onChange={setCity} />
        <Input label="آدرس" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ImageUploader label="لوگو" value={logo} onChange={setLogo} max={1} previewClassName="h-20 w-20 rounded-full" />
        <ImageUploader label="بنر" value={banner} onChange={setBanner} max={1} previewClassName="h-20 w-full" />
      </div>
      <div className="flex justify-end">
        <Button onClick={onCreate} disabled={isLoading || !name.trim()}>
          ساخت آژانس
        </Button>
      </div>
    </div>
  );
}

function memberName(m: AgencyMember): string {
  const full = `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`.trim();
  return full || m.user?.phone || '—';
}

function AgencyContent({ agencyId }: { agencyId: number }) {
  const { user } = useAuth();
  const { data: agency, error, isLoading, refresh } = useAgency(agencyId);
  const members = useAgencyMembers(agencyId);
  const { submit: update, isLoading: saving } = useUpdateAgency(agencyId);
  const { submit: removeMember } = useRemoveMember(agencyId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState<City | null>(null);
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
      setCity(agency.city ?? null);
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
        cityId: city?.id,
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

  return (
    <div className="space-y-4 grow flex flex-col overflow-auto">
      {agency && !agency.isConfirmed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
          آژانس شما در انتظار تأیید مدیر است. تا پیش از تأیید، امکان ثبت آگهی یا مشتری وجود ندارد.
        </div>
      )}

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
              <CitySelect value={city} onChange={setCity} />
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

export default function AgencyPage() {
  const { user } = useAuth();
  const agencyId = user?.roles.find(
    (r) => r.role === Role.OWNER && r.agency?.id,
  )?.agency?.id;

  return (
    <RoleProtectedRoute
      allowedRoles={[Role.USER, Role.MEMBER, Role.MANAGER, Role.OWNER, Role.ADMIN]}
    >
      <DashbaordLayout>
        {agencyId ? <AgencyContent agencyId={agencyId} /> : <CreateAgency />}
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
