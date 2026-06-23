'use client';

import { getRoleName, Role } from '@/components/auth/auth.constants.roles';
import { ApiError } from '@/libs/api/api.types.error';
import { Button, Input, Modal } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useInviteMember } from './agency.api';

const ROLE_ITEMS = [Role.MEMBER, Role.MANAGER, Role.OWNER].map((r) => ({
  label: getRoleName(r),
  value: r,
}));

interface InviteMemberModalProps {
  agencyId: number;
  isOpen: boolean;
  onClose: () => void;
  onInvited: () => void;
}

export function InviteMemberModal({
  agencyId,
  isOpen,
  onClose,
  onInvited,
}: InviteMemberModalProps) {
  const { submit, isLoading } = useInviteMember(agencyId);

  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>(Role.MEMBER);

  const close = () => {
    setPhone('');
    setFirstName('');
    setLastName('');
    setRole(Role.MEMBER);
    onClose();
  };

  const handleSubmit = async () => {
    if (!phone.trim()) return;
    try {
      await submit({
        phone: phone.trim(),
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role,
      });
      toast.success('عضو دعوت شد');
      onInvited();
      close();
    } catch (e) {
      toast.error((e as ApiError).message || 'دعوت ناموفق بود');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} className="lg:w-[28rem]">
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="font-bold text-slate-700">افزودن کاربر جدید</h2>
          <button onClick={close} className="text-slate-400 hover:text-slate-700">
            <IconX size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <Input
            label="شماره تماس"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="نام"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="نام خانوادگی"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium mb-2 block text-slate-700">نقش</label>
            <Dropdown<Role>
              items={ROLE_ITEMS}
              value={role}
              onChange={(v) => {
                if (v) setRole(v);
              }}
              variant="outline"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <Button variant="outline" onClick={close}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !phone.trim()}>
            افزودن کاربر
          </Button>
        </div>
      </div>
    </Modal>
  );
}
