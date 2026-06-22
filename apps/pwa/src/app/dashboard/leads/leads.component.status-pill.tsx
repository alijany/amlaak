'use client';

import { StatusPill, StatusTone, StatusTones } from '@/ui/atoms';
import { LEAD_STATUS_LABEL } from './leads.constants';
import { LeadStatus } from './leads.types';

const TONE: Record<LeadStatus, StatusTone> = {
  [LeadStatus.NEW]: StatusTones.sky,
  [LeadStatus.CONTACTED]: StatusTones.amber,
  [LeadStatus.QUALIFIED]: StatusTones.violet,
  [LeadStatus.WON]: StatusTones.emerald,
  [LeadStatus.LOST]: StatusTones.rose,
};

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  return (
    <StatusPill
      tone={TONE[status] ?? StatusTones.slate}
      label={LEAD_STATUS_LABEL[status] ?? status}
    />
  );
}
