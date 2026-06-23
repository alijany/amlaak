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
  useRemoveMember,
  useUpdateAgency,
} from './agency.api';
import { InviteMemberModal } from './agency.component.invite-modal';
import { AgencyMember } from './agency.types';

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
            دعوت عضو
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
    <RoleProtectedRoute allowedRoles={[Role.OWNER, Role.MANAGER, Role.ADMIN]}>
      <DashbaordLayout>
        {agencyId ? (
          <AgencyContent agencyId={agencyId} />
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
            برای مدیریت، یک آژانس را از منوی نقش‌ها انتخاب کنید.
          </div>
        )}
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
