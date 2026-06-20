'use client';

import { Button } from '@/ui/atoms';
import { IconExternalLink, IconLogin2, IconPlayerPlay } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useEnqueueJob, useTargetAuth } from './crawler.api';
import { OtpLoginModal } from './crawler.component.otp-login-modal';
import {
  AccessibilityPill,
  AuthStatusPill,
  TargetStatusPill,
} from './crawler.component.status-pill';
import { CrawlTarget, CrawlerAuthStatus } from './crawler.types';

interface TargetCardProps {
  target: CrawlTarget;
  onRefresh?: () => void;
}

export function TargetCard({ target, onRefresh }: TargetCardProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const { data: auth, refresh: refreshAuth } = useTargetAuth(target.id);
  const enqueue = useEnqueueJob(target.id);

  const authStatus = auth?.authStatus ?? CrawlerAuthStatus.LOGIN_REQUIRED;
  const needsLogin =
    target.requiresAuth && authStatus !== CrawlerAuthStatus.LOGGED_IN;

  const handleRun = async () => {
    setMessage(undefined);
    try {
      await enqueue.submit({ maxItems: 12 });
      setMessage('کراول در صف اجرا قرار گرفت.');
      onRefresh?.();
    } catch (err) {
      setMessage(
        (err as { message?: string })?.message ?? 'اجرای کراول ناموفق بود.',
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="font-bold text-slate-700">{target.name}</div>
          <div className="text-[12px] text-slate-400 ltr:text-left">
            {target.baseUrl}
            {target.startPath}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <TargetStatusPill status={target.status} />
          <AccessibilityPill status={target.accessibility} />
          {target.requiresAuth && <AuthStatusPill status={authStatus} />}
        </div>
      </div>

      {target.lastError && (
        <div className="text-[11px] text-rose-500">{target.lastError}</div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {target.requiresAuth && (
          <Button
            variant={needsLogin ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setLoginOpen(true)}
          >
            <IconLogin2 className="size-4 ml-1" />
            {authStatus === CrawlerAuthStatus.LOGGED_IN ? 'مدیریت نشست' : 'ورود'}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleRun}
          disabled={enqueue.isLoading || needsLogin}
          title={needsLogin ? 'ابتدا وارد شوید' : undefined}
        >
          <IconPlayerPlay className="size-4 ml-1" />
          {enqueue.isLoading ? 'در حال صف‌بندی...' : 'اجرای کراول'}
        </Button>

        <Link href={`/dashboard/crawler/ads?targetId=${target.id}`}>
          <Button variant="ghost" size="sm">
            <IconExternalLink className="size-4 ml-1" />
            آگهی‌ها
          </Button>
        </Link>
      </div>

      {message && <div className="text-[11px] text-slate-500">{message}</div>}

      <OtpLoginModal
        target={target}
        authStatus={authStatus}
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onChanged={() => {
          refreshAuth();
          onRefresh?.();
        }}
      />
    </div>
  );
}
