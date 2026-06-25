'use client';

import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { Button } from '@/ui/atoms';
import {
  IconArrowLeft,
  IconBuildingCommunity,
  IconPlus,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useMyAgencies } from './agency/agency.api';
import { Greeting } from './dashboard.component.shared';

/** Normal user (no agency yet) — onboarding CTA to create or join an agency. */
export function UserDashboard() {
  const myAgencies = useMyAgencies();
  const agencies = myAgencies.data?.items ?? [];

  return (
    <div className="space-y-4 grow flex flex-col overflow-auto">
      <Greeting subtitle="برای شروع، یک آژانس بسازید یا به آژانس خود بپیوندید" />

      <div className="rounded-2xl bg-white p-8 text-center max-w-lg mx-auto w-full space-y-4">
        <div className="rounded-2xl bg-slate-50 p-3 text-slate-500 inline-flex">
          <IconBuildingCommunity size={28} />
        </div>
        <div className="font-bold text-slate-700 text-lg">
          هنوز آژانسی ندارید
        </div>
        <p className="text-[13px] text-slate-500 leading-6">
          برای ثبت آگهی و دریافت مشتری، آژانس خود را بسازید یا با دعوت‌نامه به یک
          آژانس بپیوندید.
        </p>
        <Link href={RouteItems.agency.href}>
          <Button size="sm">
            <IconPlus size={16} className="ml-1" />
            ساخت آژانس
          </Button>
        </Link>
      </div>

      {agencies.length > 0 && (
        <div className="rounded-2xl bg-white p-4 max-w-lg mx-auto w-full space-y-2">
          <div className="font-bold text-slate-700 mb-1">آژانس‌های من</div>
          {agencies.map((a) => (
            <Link
              key={a.id}
              href={RouteItems.agency.href}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-slate-200 transition-colors"
            >
              <span className="text-slate-700 text-sm">{a.name}</span>
              <IconArrowLeft size={16} className="text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
