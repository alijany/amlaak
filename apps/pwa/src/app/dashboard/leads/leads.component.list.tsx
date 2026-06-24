'use client';

import { IconBuildingEstate, IconPhone, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { LEAD_SOURCE_LABEL } from './leads.constants';
import { LeadStatusPill } from './leads.component.status-pill';
import { Lead } from './leads.types';

/** Where the lead currently sits: owned by an agency, queued in a pool, or unassigned. */
function ownerLabel(lead: Lead): string {
  if (lead.agency) return `آژانس: ${lead.agency.name}`;
  if (lead.pool) return `صف: ${lead.pool.name}`;
  return 'واگذار نشده';
}

export function LeadRow({ lead }: { lead: Lead }) {
  return (
    <Link
      href={`/dashboard/leads/${lead.id}`}
      className="rounded-2xl border border-slate-100 bg-white p-4 flex flex-col gap-2.5 hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 min-w-0">
          <IconBuildingEstate size={15} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">
            {lead.advertisement?.title ?? 'آگهی بدون عنوان'}
          </span>
        </div>
        <LeadStatusPill status={lead.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slate-500">
        {lead.contactName && (
          <span className="inline-flex items-center gap-1">
            <IconUser size={13} className="text-slate-400" />
            {lead.contactName}
          </span>
        )}
        {lead.contactPhone && (
          <span className="inline-flex items-center gap-1 dir-ltr">
            <IconPhone size={13} className="text-slate-400" />
            {lead.contactPhone}
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
          {LEAD_SOURCE_LABEL[lead.source]}
        </span>
        {lead.trackingCode && (
          <span className="font-mono text-[11px] text-slate-400">
            {lead.trackingCode}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
        <span>{ownerLabel(lead)}</span>
        <span>
          {new Date(lead.created_at).toLocaleDateString('fa-IR', {
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
    </Link>
  );
}
