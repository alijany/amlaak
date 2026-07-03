'use client';

import { Button, Input } from '@/ui/atoms';
import { Modal } from '@/ui/atoms/ui.modal';
import { IconLink, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useEnqueueJob } from './crawler.api';
import { CrawlJobType, CrawlTarget } from './crawler.types';

interface UrlCrawlModalProps {
  target: CrawlTarget;
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

/**
 * Modal to crawl a specific Divar URL (detail page or pre-filtered listing).
 * Admin pastes a URL they've pre-configured on Divar.ir (with city/category filters already applied).
 * The crawled ad(s) are auto-published to Telegram immediately (no manual approval step).
 */
export function UrlCrawlModal({
  target,
  isOpen,
  onClose,
  onChanged,
}: UrlCrawlModalProps) {
  const enqueue = useEnqueueJob(target.id);
  const [url, setUrl] = useState('');
  const [hint, setHint] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setHint(undefined);
    }
  }, [isOpen]);

  const crawl = async () => {
    setHint(undefined);
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setHint('لطفاً URL را وارد کنید.');
      return;
    }

    if (!trimmedUrl.includes('divar.ir')) {
      setHint('لطفاً یک URL معتبر Divar وارد کنید.');
      return;
    }

    try {
      await enqueue.submit({
        type: CrawlJobType.SINGLE_AD,
        params: { url: trimmedUrl },
      });
      setHint('کراول فوری شروع شد و نتایج در Telegram منتشر خواهند شد.');
      onChanged?.();
      // Close after a short delay so user sees the success message
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setHint(
        (err as { message?: string })?.message ?? 'کراول ناموفق بود.',
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      crawl();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="lg:min-w-[520px] bg-white">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg text-slate-700">
            کراول URL — {target.name}
          </div>
          <Button variant="outline" className="!px-2" onClick={onClose}>
            <IconX className="size-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="font-medium text-slate-700 text-sm block">
            Divar URL
          </label>
          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://divar.ir/v/gilan-province/real-estate/apartment/abc123"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 resize-none"
            rows={3}
          />
          <p className="text-[11px] text-slate-400">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            URL معتبر Divar وارد کنید (مثلاً آگهی خاص یا صفحه فیلتر‌شده). فیلتر‌های
            شهر و دسته‌بندی باید در URL حاضر باشند.
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-[11px] text-slate-600 space-y-1">
          <div className="font-medium">نکات مهم:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>فیلتر‌ها را روی Divar اعمال کنید، سپس URL را کپی کنید</li>
            <li>
              کراول‌های URL فوری منتشر می‌شوند (تایید نیازی ندارند)
            </li>
            <li>نتایج فوری در کانال Telegram ارسال خواهند شد</li>
          </ul>
        </div>

        <Button
          onClick={crawl}
          disabled={enqueue.isLoading || !url.trim()}
          className="w-full"
        >
          <IconLink className="size-4 ml-1" />
          {enqueue.isLoading ? 'در حال کراول...' : 'کراول و انتشار'}
        </Button>

        {hint && (
          <div
            className={`text-[12px] ${
              hint.includes('ناموفق')
                ? 'text-rose-500'
                : 'text-slate-500'
            }`}
          >
            {hint}
          </div>
        )}
      </div>
    </Modal>
  );
}
