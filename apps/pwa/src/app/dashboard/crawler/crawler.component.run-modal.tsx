'use client';

import { Button, Input } from '@/ui/atoms';
import { Modal } from '@/ui/atoms/ui.modal';
import { IconPlayerPlay, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useEnqueueJob } from './crawler.api';
import { CrawlJobType, CrawlTarget } from './crawler.types';

interface RunCrawlModalProps {
  target: CrawlTarget;
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

/**
 * Configure and start a one-off crawl job: job type, ad count, scroll depth and
 * the delay between actions. Maps to `POST /crawler/targets/:id/jobs`
 * ({ type, maxItems, params: { maxScrolls, crawlDelayMs } }).
 */
export function RunCrawlModal({
  target,
  isOpen,
  onClose,
  onChanged,
}: RunCrawlModalProps) {
  const enqueue = useEnqueueJob(target.id);

  const [jobType, setJobType] = useState<CrawlJobType>(CrawlJobType.FULL_SCAN);
  const [maxItems, setMaxItems] = useState('12');
  const [maxScrolls, setMaxScrolls] = useState('25');
  const [crawlDelayMs, setCrawlDelayMs] = useState('');
  const [hint, setHint] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) setHint(undefined);
  }, [isOpen]);

  const run = async () => {
    setHint(undefined);
    try {
      await enqueue.submit({
        type: jobType,
        maxItems: Number(maxItems) || 12,
        params: {
          maxScrolls: Number(maxScrolls) || 25,
          ...(crawlDelayMs ? { crawlDelayMs: Number(crawlDelayMs) } : {}),
        },
      });
      setHint('کراول در صف اجرا قرار گرفت.');
      onChanged?.();
      onClose();
    } catch (err) {
      setHint(
        (err as { message?: string })?.message ?? 'اجرای کراول ناموفق بود.',
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="lg:min-w-[480px] bg-white">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg text-slate-700">
            اجرای کراول — {target.name}
          </div>
          <Button variant="outline" className="!px-2" onClick={onClose}>
            <IconX className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="font-medium mb-2 text-slate-700">نوع کراول</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as CrawlJobType)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            >
              <option value={CrawlJobType.FULL_SCAN}>کامل</option>
              <option value={CrawlJobType.INCREMENTAL}>افزایشی</option>
            </select>
          </div>
          <Input
            label="تعداد آگهی"
            type="number"
            value={maxItems}
            onChange={(e) => setMaxItems(e.target.value)}
            min={1}
            max={60}
          />
          <Input
            label="عمق اسکرول"
            type="number"
            value={maxScrolls}
            onChange={(e) => setMaxScrolls(e.target.value)}
            min={1}
            max={50}
          />
          <Input
            label="تأخیر بین اقدامات (ms)"
            type="number"
            value={crawlDelayMs}
            onChange={(e) => setCrawlDelayMs(e.target.value)}
            placeholder="پیش‌فرض"
            min={0}
          />
        </div>

        <div className="text-[11px] text-slate-400 leading-5">
          تعداد آگهی، حداکثر تعداد آگهی برای جمع‌آوری است. عمق اسکرول، سقف
          اسکرول‌ها برای بارگذاری آگهی‌های بیشتر را تعیین می‌کند. تأخیر بین
          اقدامات، فاصلهٔ زمانی بین واکشی هر آگهی است.
        </div>

        <Button onClick={run} disabled={enqueue.isLoading || !maxItems}>
          <IconPlayerPlay className="size-4 ml-1" />
          {enqueue.isLoading ? 'در حال صف‌بندی...' : 'اجرای کراول'}
        </Button>

        {hint && <div className="text-[12px] text-slate-500">{hint}</div>}
      </div>
    </Modal>
  );
}
