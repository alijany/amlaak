'use client';

import { useAuth } from '@/components/auth/auth.context.provider';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DataView } from '@/ui/molecules';
import {
  IconChevronLeft,
  IconHomePlus,
  IconPhoneCall,
  IconTrophy,
  IconUserCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useAgency } from './agency/agency.api';
import { PublishStatusPill } from './crawler/crawler.component.status-pill';
import { Greeting, Kpi, LeadFunnelCard, fa } from './dashboard.component.shared';
import { useLeadStats } from './leads/leads.api';
import { LeadStatus } from './leads/leads.types';
import { useMyListings } from './listings/listings.api';

/** Agency staff (owner/manager/member) — their own agency's leads and listings. */
export function AgencyDashboard() {
  const { selectedRole } = useAuth();
  const agencyId = selectedRole?.agency?.id;
  const { data: agency } = useAgency(agencyId);
  const isConfirmed = agency ? agency.isConfirmed !== false : true;

  const stats = useLeadStats();
  const listings = useMyListings();

  const byStatus = stats.data?.byStatus;

  return (
    <div className="space-y-4 grow flex flex-col overflow-auto">
      <Greeting
        subtitle={
          selectedRole?.agency?.name
            ? `نمای کلی فعالیت ${selectedRole.agency.name}`
            : 'نمای کلی فعالیت آژانس شما'
        }
      />

      {!isConfirmed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
          آژانس شما در انتظار تأیید مدیر است. تا پیش از تأیید، امکان ثبت آگهی و
          دریافت مشتری وجود ندارد.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={<IconHomePlus size={20} />}
          label="آگهی‌های من"
          value={fa(listings.data?.meta?.total)}
          href={RouteItems.myListings.href}
        />
        <Kpi
          icon={<IconPhoneCall size={20} />}
          label="مشتری‌های جدید"
          value={fa(byStatus?.[LeadStatus.NEW])}
          href={RouteItems.leads.href}
        />
        <Kpi
          icon={<IconUserCheck size={20} />}
          label="کل مشتری‌ها"
          value={fa(stats.data?.total)}
          href={RouteItems.leads.href}
        />
        <Kpi
          icon={<IconTrophy size={20} />}
          label="موفق"
          value={fa(byStatus?.[LeadStatus.WON])}
          href={RouteItems.leads.href}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LeadFunnelCard />

        {/* Recent own listings */}
        <div className="rounded-2xl bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-slate-700">آخرین آگهی‌های من</div>
            <Link
              href={RouteItems.myListings.href}
              className="text-[12px] text-blue-500 hover:underline flex items-center"
            >
              همه
              <IconChevronLeft size={14} />
            </Link>
          </div>
          <DataView
            data={listings.data}
            error={listings.error}
            isLoading={listings.isLoading}
            isEmpty={(d) => !d?.items.length}
            emptyMessage="هنوز آگهی‌ای ثبت نکرده‌اید. از «آگهی‌های من» شروع کنید."
            onRetry={listings.refresh}
            variant="inline"
            className="space-y-3"
          >
            {listings.data?.items?.slice(0, 6).map((l) => (
              <Link
                key={l.id}
                href={`/dashboard/listings/${l.id}`}
                className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between gap-3 hover:border-slate-200 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-700 truncate">
                    {l.title ?? 'بدون عنوان'}
                  </div>
                  <div className="text-[12px] text-slate-400 truncate">
                    {[l.city?.nameFa, l.district].filter(Boolean).join(' · ')}
                    {l.totalPrice != null &&
                      ` · ${l.totalPrice.toLocaleString('fa-IR')} تومان`}
                  </div>
                </div>
                <PublishStatusPill status={l.publishStatus} />
              </Link>
            ))}
          </DataView>
        </div>
      </div>
    </div>
  );
}
