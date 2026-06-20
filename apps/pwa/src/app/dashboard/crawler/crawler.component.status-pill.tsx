'use client';

import {
  CrawlJobStatus,
  CrawlTargetStatus,
  CrawlerAuthStatus,
  TargetAccessibility,
} from './crawler.types';

type Tone = { bg: string; text: string; dot: string };

const EMERALD: Tone = { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
const SKY: Tone = { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' };
const AMBER: Tone = { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' };
const ROSE: Tone = { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' };
const SLATE: Tone = { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };

/** Small, reusable status badge. */
export function StatusPill({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={`inline-flex items-center justify-end gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tone.bg} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {label}
    </span>
  );
}

export function TargetStatusPill({ status }: { status: CrawlTargetStatus }) {
  const map: Record<CrawlTargetStatus, [Tone, string]> = {
    [CrawlTargetStatus.READY]: [EMERALD, 'آماده'],
    [CrawlTargetStatus.RUNNING]: [SKY, 'در حال اجرا'],
    [CrawlTargetStatus.ERROR]: [ROSE, 'خطا'],
    [CrawlTargetStatus.NOT_CONFIGURED]: [SLATE, 'پیکربندی نشده'],
  };
  const [tone, label] = map[status] ?? [SLATE, status];
  return <StatusPill tone={tone} label={label} />;
}

export function AuthStatusPill({ status }: { status: CrawlerAuthStatus }) {
  const map: Record<CrawlerAuthStatus, [Tone, string]> = {
    [CrawlerAuthStatus.LOGGED_IN]: [EMERALD, 'وارد شده'],
    [CrawlerAuthStatus.OTP_PENDING]: [AMBER, 'در انتظار کد'],
    [CrawlerAuthStatus.LOGIN_REQUIRED]: [SLATE, 'نیازمند ورود'],
    [CrawlerAuthStatus.ERROR]: [ROSE, 'خطای ورود'],
  };
  const [tone, label] = map[status] ?? [SLATE, status];
  return <StatusPill tone={tone} label={label} />;
}

export function AccessibilityPill({ status }: { status: TargetAccessibility }) {
  const map: Record<TargetAccessibility, [Tone, string]> = {
    [TargetAccessibility.ONLINE]: [EMERALD, 'در دسترس'],
    [TargetAccessibility.OFFLINE]: [ROSE, 'در دسترس نیست'],
    [TargetAccessibility.UNKNOWN]: [SLATE, 'نامشخص'],
  };
  const [tone, label] = map[status] ?? [SLATE, status];
  return <StatusPill tone={tone} label={label} />;
}

export function JobStatusPill({ status }: { status: CrawlJobStatus }) {
  const map: Record<CrawlJobStatus, [Tone, string]> = {
    [CrawlJobStatus.COMPLETED]: [EMERALD, 'تکمیل شد'],
    [CrawlJobStatus.RUNNING]: [SKY, 'در حال اجرا'],
    [CrawlJobStatus.QUEUED]: [AMBER, 'در صف'],
    [CrawlJobStatus.PENDING]: [AMBER, 'در انتظار'],
    [CrawlJobStatus.FAILED]: [ROSE, 'ناموفق'],
    [CrawlJobStatus.CANCELED]: [SLATE, 'لغو شده'],
  };
  const [tone, label] = map[status] ?? [SLATE, status];
  return <StatusPill tone={tone} label={label} />;
}
