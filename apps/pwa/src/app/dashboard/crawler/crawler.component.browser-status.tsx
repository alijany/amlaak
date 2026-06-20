'use client';

import { IconBrowser } from '@tabler/icons-react';
import { useBrowserStatus } from './crawler.api';
import { StatusPill } from './crawler.component.status-pill';

const EMERALD = { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
const ROSE = { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' };
const SLATE = { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };

/**
 * Compact health indicator for the Camoufox browser backend. Real-browser
 * crawlers (e.g. Divar) need it; the Mock target does not.
 */
export function BrowserStatus() {
  const { data, isLoading } = useBrowserStatus();

  if (isLoading && !data) {
    return <StatusPill tone={SLATE} label="بررسی مرورگر..." />;
  }

  if (!data?.configured) {
    return <StatusPill tone={SLATE} label="مرورگر پیکربندی نشده" />;
  }

  if (!data.available) {
    return <StatusPill tone={ROSE} label="مرورگر در دسترس نیست" />;
  }

  const tabs = data.activeTabs ?? 0;
  return (
    <span className="inline-flex items-center gap-1.5">
      <IconBrowser className="size-4 text-slate-400" />
      <StatusPill
        tone={EMERALD}
        label={`مرورگر آماده${tabs ? ` · ${tabs} تب فعال` : ''}`}
      />
    </span>
  );
}
