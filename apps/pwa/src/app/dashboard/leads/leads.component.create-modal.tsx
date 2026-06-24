'use client';

import { ApiError } from '@/libs/api/api.types.error';
import { fetcher } from '@/libs/api/api.util.fetcher';
import { Button, Input, Modal } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { IconCheck, IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useMyAgencies } from '../agency/agency.api';
import { useCreateLead, useLeadPools } from './leads.api';
import { LEAD_SOURCE_LABEL } from './leads.constants';
import { LeadSource, LookupResponse } from './leads.types';

const SOURCE_ITEMS = Object.values(LeadSource).map((s) => ({
  label: LEAD_SOURCE_LABEL[s],
  value: s,
}));

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateLeadModal({
  isOpen,
  onClose,
  onCreated,
}: CreateLeadModalProps) {
  const { submit, isLoading } = useCreateLead();
  const { data: pools } = useLeadPools();
  const { data: agencies } = useMyAgencies();

  const [code, setCode] = useState('');
  const [resolved, setResolved] = useState<LookupResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  const [source, setSource] = useState<LeadSource>(LeadSource.PHONE_CALL);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');
  const [poolId, setPoolId] = useState<number | ''>('');
  const [agencyId, setAgencyId] = useState<number | ''>('');

  const reset = () => {
    setCode('');
    setResolved(null);
    setLookupError(null);
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

  const lookup = async () => {
    if (!code.trim()) return;
    setLooking(true);
    setLookupError(null);
    setResolved(null);
    try {
      const res = await fetcher<LookupResponse>(
        `/leads/lookup?code=${encodeURIComponent(code.trim())}`,
      );
      setResolved(res);
    } catch (e) {
      setLookupError((e as ApiError).message || 'آگهی با این کد یافت نشد');
    } finally {
      setLooking(false);
    }
  };

  const handleSubmit = async () => {
    if (!resolved) return;
    try {
      await submit({
        advertisementId: resolved.advertisement.id,
        trackingCode: resolved.trackingCode,
        source,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        note: note || undefined,
        poolId: poolId === '' ? undefined : Number(poolId),
        agencyId: agencyId === '' ? undefined : Number(agencyId),
      });
      toast.success('مشتری ثبت شد');
      onCreated();
      close();
    } catch (e) {
      toast.error((e as ApiError).message || 'ثبت مشتری ناموفق بود');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} className="lg:w-[32rem] flex flex-col">
      <div className="contents">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="font-bold text-slate-700">ثبت مشتری جدید</h2>
          <button onClick={close} className="text-slate-400 hover:text-slate-700">
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-5 py-4 space-y-4">
          {/* Listing lookup by tracking code */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <Input
                label="کد رهگیری آگهی"
                placeholder="مثلاً NV-2A"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                containerClassName="grow"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={lookup}
                disabled={looking || !code.trim()}
              >
                <IconSearch size={16} className="ml-1" />
                یافتن
              </Button>
            </div>
            {lookupError && (
              <p className="text-rose-500 text-xs">{lookupError}</p>
            )}
            {resolved && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <IconCheck size={16} className="flex-shrink-0" />
                <span className="truncate">
                  {resolved.advertisement.title ?? 'آگهی'} ·{' '}
                  {[
                    resolved.advertisement.city,
                    resolved.advertisement.district,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </span>
              </div>
            )}
          </div>

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
            disabled={isLoading || !resolved || (!agencyId && !poolId)}
          >
            ثبت مشتری
          </Button>
        </div>
      </div>
    </Modal>
  );
}
