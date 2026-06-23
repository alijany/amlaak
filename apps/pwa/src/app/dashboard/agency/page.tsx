'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { getRoleName, Role } from '@/components/auth/auth.constants.roles';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ApiError } from '@/libs/api/api.types.error';
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

  const onCreate = async () => {
    if (!name.trim()) return;
    try {
      await submit({ name: name.trim(), phone: phone || undefined });
      toast.success('آژانس ساخته شد. از منوی نقش‌ها آن را انتخاب کنید.');
      refreshProfile();
    } catch (e) {
      toast.error((e as ApiError).message || 'ساخت آژانس ناموفق بود');
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-2xl bg-white p-6 space-y-3">
      <div className="font-bold text-slate-700">ساخت آژانس جدید</div>
      <p className="text-[13px] text-slate-500">
        با ساخت آژانس، می‌توانید آگهی ثبت کنید، اعضا را دعوت کنید و سرنخ‌ها را مدیریت کنید.
      </p>
      <Input label="نام آژانس" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="تلفن (اختیاری)" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
  const { data: agency, error, isLoading, refresh } = useAgency(agencyId);
  const members = useAgencyMembers(agencyId);
  const { submit: update, isLoading: saving } = useUpdateAgency(agencyId);
  const { submit: removeMember } = useRemoveMember(agencyId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (agency) {
      setName(agency.name ?? '');
      setPhone(agency.phone ?? '');
      setDescription(agency.description ?? '');
    }
  }, [agency]);

  const onSave = async () => {
    try {
      await update({ name, phone: phone || undefined, description: description || undefined });
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
      <h1 className="font-bold text-slate-800 text-xl">آژانس</h1>

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
            </div>
            <Input
              label="توضیحات"
              textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
          {members.data?.items?.map((m) => (
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
                className="text-slate-400 hover:text-rose-500 p-1.5"
                title="حذف"
              >
                <IconTrash size={16} />
              </button>
            </div>
          ))}
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
  const { selectedRole } = useAuth();
  const agencyId = selectedRole?.agency?.id;

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
