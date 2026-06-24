'use client';

import { ApiError } from '@/libs/api/api.types.error';
import { Button, Input, Modal } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useMyAgencies } from '../agency/agency.api';
import { useCreateLead, useLeadPools } from '../leads/leads.api';
import { LEAD_SOURCE_LABEL } from '../leads/leads.constants';
import { LeadSource } from '../leads/leads.types';

const SOURCE_ITEMS = Object.values(LeadSource).map((s) => ({
  label: LEAD_SOURCE_LABEL[s],
  value: s,
}));

interface QuickLeadModalProps {
  advertisementId: number;
  listingTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function QuickLeadModal({
  advertisementId,
  listingTitle,
  isOpen,
  onClose,
  onCreated,
}: QuickLeadModalProps) {
  const { submit, isLoading } = useCreateLead();
  const { data: pools } = useLeadPools();
  const { data: agencies } = useMyAgencies();

  const [source, setSource] = useState<LeadSource>(LeadSource.PHONE_CALL);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');
  const [poolId, setPoolId] = useState<number | ''>('');
  const [agencyId, setAgencyId] = useState<number | ''>('');

  const reset = () => {
    setSource(LeadSource.PHONE_CALL);
    setContactName('');
    setContactPhone('');
    setNote('');
    setPoolId('');
    setAgencyId('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await submit({
        advertisementId,
        source,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        note: note || undefined,
        poolId: poolId === '' ? undefined : Number(poolId),
        agencyId: agencyId === '' ? undefined : Number(agencyId),
      });
      toast.success('مشتری ثبت شد');
      onCreated?.();
      close();
    } catch (e) {
      toast.error((e as ApiError).message || 'ثبت مشتری ناموفق بود');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} className="lg:w-[32rem] flex flex-col">
      <div className="contents">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-bold text-slate-700">افزودن مشتری</h2>
            {listingTitle && (
              <p className="text-[12px] text-slate-400 truncate">{listingTitle}</p>
            )}
          </div>
          <button onClick={close} className="text-slate-400 hover:text-slate-700">
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="نام تماس‌گیرنده"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              label="شماره تماس"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium mb-2 block text-slate-700">منبع</label>
              <Dropdown<LeadSource>
                items={SOURCE_ITEMS}
                value={source}
                onChange={(v) => {
                  if (v) setSource(v);
                }}
                variant="outline"
              />
            </div>
            <div>
              <label className="font-medium mb-2 block text-slate-700">
                آژانس
              </label>
              <Dropdown<number | ''>
                items={[
                  { label: 'انتخاب آژانس', value: '' },
                  ...(agencies?.items ?? []).map((a) => ({
                    label: a.name,
                    value: a.id,
                  })),
                ]}
                value={agencyId}
                onChange={(v) => {
                  setAgencyId(v ?? '');
                  if (v) setPoolId('');
                }}
                variant="outline"
              />
            </div>
          </div>

          <div>
            <label className="font-medium mb-2 block text-slate-700">
              یا صف
            </label>
            <Dropdown<number | ''>
              items={[
                { label: 'انتخاب صف', value: '' },
                ...(pools?.items ?? []).map((p) => ({
                  label: p.name,
                  value: p.id,
                })),
              ]}
              value={poolId}
              onChange={(v) => {
                setPoolId(v ?? '');
                if (v) setAgencyId('');
              }}
              variant="outline"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              لید را به یک آژانس یا یک صف واگذار کنید (فقط یکی).
            </p>
          </div>

          <Input
            label="یادداشت"
            textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <Button variant="outline" onClick={close}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!agencyId && !poolId)}
          >
            ثبت مشتری
          </Button>
        </div>
      </div>
    </Modal>
  );
}
