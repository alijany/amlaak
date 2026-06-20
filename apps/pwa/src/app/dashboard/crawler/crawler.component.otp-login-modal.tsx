'use client';

import { Button, Input } from '@/ui/atoms';
import { Modal } from '@/ui/atoms/ui.modal';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useStartLogin, useVerifyOtp } from './crawler.api';
import { AuthStatusPill } from './crawler.component.status-pill';
import { CrawlTarget, CrawlerAuthStatus } from './crawler.types';

interface OtpLoginModalProps {
  target: CrawlTarget;
  authStatus: CrawlerAuthStatus;
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

/**
 * Drives the interactive OTP login from the dashboard:
 *   enter phone -> "start" (target sends OTP) -> enter code -> "verify".
 * Backed by the backend state machine; the Mock target accepts any 4-digit code.
 */
export function OtpLoginModal({
  target,
  authStatus,
  isOpen,
  onClose,
  onChanged,
}: OtpLoginModalProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [hint, setHint] = useState<string | undefined>();

  const startLogin = useStartLogin(target.id);
  const verifyOtp = useVerifyOtp(target.id);

  // Show the OTP step as soon as the backend reports OTP_PENDING.
  const step = authStatus === CrawlerAuthStatus.OTP_PENDING ? 'otp' : 'phone';

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setHint(undefined);
    }
  }, [isOpen]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setHint(undefined);
    try {
      await startLogin.submit({ phone });
      setHint('کد تایید ارسال شد. کد دریافتی را وارد کنید.');
      onChanged?.();
    } catch {
      setHint('خطا در شروع فرآیند ورود.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setHint(undefined);
    try {
      const result = await verifyOtp.submit({ otp });
      if (result.authStatus === CrawlerAuthStatus.LOGGED_IN) {
        onChanged?.();
        onClose();
      } else {
        setHint('کد وارد شده نامعتبر است.');
      }
    } catch {
      setHint('خطا در تایید کد.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="lg:min-w-[460px] bg-white">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg text-slate-700">ورود به {target.name}</div>
          <div className="flex items-center gap-2">
            <AuthStatusPill status={authStatus} />
            <Button variant="outline" className="!px-2" onClick={onClose}>
              <IconX className="size-5" />
            </Button>
          </div>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleStart} className="space-y-4">
            <Input
              id="phone"
              label="شماره موبایل حساب مقصد"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912-345-6789"
              required
            />
            <Button type="submit" className="w-full" disabled={startLogin.isLoading || !phone}>
              {startLogin.isLoading ? 'در حال ارسال...' : 'ارسال کد تایید'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              id="otp"
              label="کد تایید"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="----"
              required
            />
            <Button type="submit" className="w-full" disabled={verifyOtp.isLoading || !otp}>
              {verifyOtp.isLoading ? 'در حال بررسی...' : 'تایید و ورود'}
            </Button>
          </form>
        )}

        {hint && <div className="text-[12px] text-slate-500">{hint}</div>}
      </div>
    </Modal>
  );
}
