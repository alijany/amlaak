'use client';

import { StatusPill, StatusTone, StatusTones } from '@/ui/atoms';
import {
  CrawlJobStatus,
  CrawlTargetStatus,
  CrawlerAuthStatus,
  TargetAccessibility,
} from './crawler.types';

// Re-exported so existing crawler imports keep working; the primitive now lives
// in @/ui/atoms (shared with the leads domain).
export { StatusPill };

type Tone = StatusTone;

const EMERALD = StatusTones.emerald;
const SKY = StatusTones.sky;
const AMBER = StatusTones.amber;
const ROSE = StatusTones.rose;
const SLATE = StatusTones.slate;

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
