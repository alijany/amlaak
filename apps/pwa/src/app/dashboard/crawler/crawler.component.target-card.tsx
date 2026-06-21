'use client';

import { Button } from '@/ui/atoms';
import {
  IconCalendarClock,
  IconExternalLink,
  IconLogin2,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useReconcileSession, useTargetAuth } from './crawler.api';
import { OtpLoginModal } from './crawler.component.otp-login-modal';
import { RunCrawlModal } from './crawler.component.run-modal';
import { ScheduleModal } from './crawler.component.schedule-modal';
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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const { data: auth, refresh: refreshAuth } = useTargetAuth(target.id);
  const reconcile = useReconcileSession(target.id);

  const authStatus = auth?.authStatus ?? CrawlerAuthStatus.LOGIN_REQUIRED;
  const needsLogin =
    target.requiresAuth && authStatus !== CrawlerAuthStatus.LOGGED_IN;
  const loggedIn = authStatus === CrawlerAuthStatus.LOGGED_IN;

  const handleReconcile = async () => {
    setMessage(undefined);
    try {
      const res = await reconcile.submit(undefined);
      setMessage(
        res.authStatus === CrawlerAuthStatus.LOGGED_IN
          ? 'نشست معتبر است.'
          : 'نشست منقضی شده است؛ لطفاً دوباره وارد شوید.',
      );
      refreshAuth();
    } catch {
      setMessage('بررسی نشست ناموفق بود.');
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
          onClick={() => setRunOpen(true)}
          disabled={needsLogin}
          title={needsLogin ? 'ابتدا وارد شوید' : undefined}
        >
          <IconPlayerPlay className="size-4 ml-1" />
          اجرای کراول
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setScheduleOpen(true)}
        >
          <IconCalendarClock className="size-4 ml-1" />
          زمان‌بندی
        </Button>

        {loggedIn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReconcile}
            disabled={reconcile.isLoading}
            title="بررسی اعتبار نشست"
          >
            <IconRefresh className="size-4 ml-1" />
            {reconcile.isLoading ? 'در حال بررسی...' : 'بررسی نشست'}
          </Button>
        )}

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

      <ScheduleModal
        target={target}
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onChanged={() => onRefresh?.()}
      />

      <RunCrawlModal
        target={target}
        isOpen={runOpen}
        onClose={() => setRunOpen(false)}
        onChanged={() => onRefresh?.()}
      />
    </div>
  );
}
