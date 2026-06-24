'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { useAuth } from '@/components/auth/auth.context.provider';
import { Role } from '@/components/auth/auth.constants.roles';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { ApiError } from '@/libs/api/api.types.error';
import { Button, Input } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { DataView } from '@/ui/molecules';
import {
  IconArrowRight,
  IconExternalLink,
  IconMapPin,
  IconPhone,
  IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'react-toastify';
import { useUsers } from '../../users/users.api';
import {
  useAssignLead,
  useLead,
  useUpdateLead,
} from '../leads.api';
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER } from '../leads.constants';
import { LeadStatusPill } from '../leads.component.status-pill';
import { Lead, LeadStatus } from '../leads.types';


function formatPrice(value?: number): string | undefined {
  if (value == null) return undefined;
  return `${value.toLocaleString('fa-IR')} تومان`;
}

function LeadDetail({ lead, refresh }: { lead: Lead; refresh: () => void }) {
  const { selectedRole } = useAuth();
  const isAdmin = selectedRole?.role === Role.ADMIN;

  const { submit: updateLead, isLoading: updating } = useUpdateLead(lead.id);
  const { submit: assignLead, isLoading: assigning } = useAssignLead(lead.id);
  const { data: users } = useUsers(isAdmin ? { limit: 100 } : undefined);

  const [note, setNote] = useState(lead.note ?? '');
  const ad = lead.advertisement;
  const price =
    formatPrice(ad?.totalPrice) ??
    (ad?.deposit != null || ad?.rent != null
      ? `${formatPrice(ad?.deposit) ?? '۰'} ودیعه / ${formatPrice(ad?.rent) ?? '۰'} اجاره`
      : undefined);

  const onStatusChange = async (status: LeadStatus | null) => {
    if (!status || status === lead.status) return;
    try {
      await updateLead({ status });
      toast.success('وضعیت به‌روزرسانی شد');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'خطا در به‌روزرسانی');
    }
  };

  const onSaveNote = async () => {
    try {
      await updateLead({ note });
      toast.success('یادداشت ذخیره شد');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'خطا در ذخیره یادداشت');
    }
  };

  const onAssign = async (agentId: number | null) => {
    if (!agentId) return;
    try {
      await assignLead({ agentId });
      toast.success('مشتری اختصاص یافت');
      refresh();
    } catch (e) {
      toast.error((e as ApiError).message || 'خطا در اختصاص مشتری');
    }
  };

  return (
    <div className="mx-auto space-y-4">
      {/* Listing card */}
      <div className="rounded-2xl bg-white p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-slate-700">
            {ad?.title ?? 'آگهی بدون عنوان'}
          </h2>
          <LeadStatusPill status={lead.status} />
        </div>
        {(ad?.city || ad?.district || ad?.province) && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <IconMapPin size={14} className="text-slate-400" />
            {[ad?.province, ad?.city, ad?.district].filter(Boolean).join(' · ')}
          </div>
        )}
        {price && <div className="font-bold text-slate-800 text-sm">{price}</div>}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[12px]">
          {lead.trackingCode && (
            <span className="font-mono text-slate-400">
              کد رهگیری: {lead.trackingCode}
            </span>
          )}
          <div className="flex items-center gap-3">
            {ad?.id && (
              <Link
                href={`/dashboard/listings/${ad.id}`}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
              >
                <IconExternalLink size={13} />
                مشاهده ملک
              </Link>
            )}
            {ad?.sourceUrl && (
              <a
                href={ad.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                <IconExternalLink size={13} />
                آگهی اصلی
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl bg-white p-4 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400">تماس‌گیرنده</div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <IconUser size={14} className="text-slate-400" />
            {lead.contactName || '—'}
          </span>
          {lead.contactPhone && (
            <a
              href={`tel:${lead.contactPhone}`}
              className="inline-flex items-center gap-1.5 text-green-600 dir-ltr"
            >
              <IconPhone size={14} />
              {lead.contactPhone}
            </a>
          )}
        </div>
        <div className="text-[12px] text-slate-400">
          کارشناس:{' '}
          {lead.assignedAgent
            ? `${lead.assignedAgent.firstName ?? ''} ${lead.assignedAgent.lastName ?? ''}`.trim() ||
              lead.assignedAgent.phone
            : 'اختصاص نیافته'}
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl bg-white p-4 space-y-4">
        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="font-medium mb-2 block text-slate-700 text-sm">
              وضعیت
            </label>
            <Dropdown<LeadStatus>
              items={LEAD_STATUS_ORDER.map((s) => ({
                label: LEAD_STATUS_LABEL[s],
                value: s,
              }))}
              value={lead.status}
              onChange={onStatusChange}
              variant="outline"
              disabled={updating}
            />
          </div>

          {isAdmin && (
            <div>
              <label className="font-medium mb-2 block text-slate-700 text-sm">
                اختصاص به کارشناس
              </label>
              <Dropdown<number>
                items={(users?.items ?? []).map((u) => ({
                  label: u.name || u.phone,
                  value: u.id,
                }))}
                value={lead.assignedAgent?.id ?? null}
                onChange={onAssign}
                placeholder="انتخاب کارشناس"
                variant="outline"
                disabled={assigning}
              />
            </div>
          )}
        </div>

        <div>
          <Input
            label="یادداشت"
            textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onSaveNote}
              disabled={updating}
            >
              ذخیره یادداشت
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadDetailContent({ id }: { id: number }) {
  const { data: lead, error, isLoading, refresh } = useLead(id);

  return (
    <div className="flex flex-col grow overflow-hidden">
      <div className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-3">
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm transition-colors"
        >
          <IconArrowRight size={16} />
          بازگشت
        </Link>
        <div className="w-px h-5 bg-slate-200" />
        <h1 className="font-bold text-slate-700">مشتری #{id.toLocaleString('fa-IR')}</h1>
      </div>

      <div className="grow overflow-auto">
        <DataView
          data={lead}
          error={error}
          isLoading={isLoading}
          isEmpty={(d) => !d}
          emptyMessage="مشتری یافت نشد."
          onRetry={refresh}
        >
          {lead && <LeadDetail lead={lead} refresh={refresh} />}
        </DataView>
      </div>
    </div>
  );
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.leads.roles}>
      <DashbaordLayout>
        <LeadDetailContent id={Number(id)} />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
