'use client';

import { Button, Input } from '@/ui/atoms';
import { Modal } from '@/ui/atoms/ui.modal';
import { ToggleSwitch } from '@/ui/atoms/ui.toggleSwitch';
import { IconClockPlay, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  useDeleteSchedule,
  useRunSchedule,
  useSchedule,
  useUpsertSchedule,
} from './crawler.api';
import { CrawlJobType, CrawlTarget } from './crawler.types';

interface ScheduleModalProps {
  target: CrawlTarget;
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

const CRON_PRESETS: { label: string; value: string }[] = [
  { label: 'هر ساعت', value: '0 * * * *' },
  { label: 'هر ۶ ساعت', value: '0 */6 * * *' },
  { label: 'روزانه ۳ بامداد', value: '0 3 * * *' },
  { label: 'هفتگی (شنبه ۲ بامداد)', value: '0 2 * * 6' },
];

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('fa-IR') : '—';

/** Admin schedule manager for one target: cron, job type, limits, run-now, delete. */
export function ScheduleModal({
  target,
  isOpen,
  onClose,
  onChanged,
}: ScheduleModalProps) {
  const { data, refresh } = useSchedule(isOpen ? target.id : undefined);
  const upsert = useUpsertSchedule(target.id);
  const runNow = useRunSchedule(target.id);
  const remove = useDeleteSchedule(target.id);

  const [enabled, setEnabled] = useState(false);
  const [cron, setCron] = useState('0 */6 * * *');
  const [timezone, setTimezone] = useState('Asia/Tehran');
  const [jobType, setJobType] = useState<CrawlJobType>(CrawlJobType.INCREMENTAL);
  const [maxItems, setMaxItems] = useState('24');
  const [maxScrolls, setMaxScrolls] = useState('');
  const [crawlDelayMs, setCrawlDelayMs] = useState('');
  const [hint, setHint] = useState<string | undefined>();

  // Hydrate the form from the loaded schedule (once per open / data change).
  useEffect(() => {
    if (!isOpen) return;
    setHint(undefined);
    if (data) {
      setEnabled(data.enabled);
      setCron(data.cron);
      setTimezone(data.timezone);
      setJobType(data.jobType);
      setMaxItems(String(data.maxItems));
      setMaxScrolls(data.maxScrolls != null ? String(data.maxScrolls) : '');
      setCrawlDelayMs(data.crawlDelayMs != null ? String(data.crawlDelayMs) : '');
    }
  }, [isOpen, data]);

  const save = async () => {
    setHint(undefined);
    try {
      await upsert.submit({
        cron: cron.trim(),
        timezone: timezone.trim() || 'UTC',
        jobType,
        maxItems: Number(maxItems) || 24,
        maxScrolls: maxScrolls ? Number(maxScrolls) : undefined,
        crawlDelayMs: crawlDelayMs ? Number(crawlDelayMs) : undefined,
        enabled,
      });
      setHint('زمان‌بندی ذخیره شد.');
      refresh();
      onChanged?.();
    } catch (err) {
      setHint((err as { message?: string })?.message ?? 'ذخیره ناموفق بود.');
    }
  };

  const handleRun = async () => {
    setHint(undefined);
    try {
      const res = await runNow.submit(undefined);
      setHint(`کراول فوری در صف قرار گرفت (کار #${res.jobId}).`);
      onChanged?.();
    } catch (err) {
      setHint((err as { message?: string })?.message ?? 'اجرا ناموفق بود.');
    }
  };

  const handleDelete = async () => {
    setHint(undefined);
    try {
      await remove.submit(undefined);
      setHint('زمان‌بندی حذف شد.');
      setEnabled(false);
      refresh();
      onChanged?.();
    } catch (err) {
      setHint((err as { message?: string })?.message ?? 'حذف ناموفق بود.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="lg:min-w-[520px] flex flex-col overflow-hidden bg-white">
      <div className="p-6 flex flex-col gap-4 overflow-auto">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg text-slate-700">
            زمان‌بندی خودکار — {target.name}
          </div>
          <Button variant="outline" className="!px-2" onClick={onClose}>
            <IconX className="size-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <div className="font-medium text-slate-700 text-sm">فعال</div>
            <div className="text-[11px] text-slate-400">
              اجرای خودکار کراول طبق زمان‌بندی
            </div>
          </div>
          <ToggleSwitch checked={enabled} onChange={setEnabled} />
        </div>

        <div className="space-y-1">
          <Input
            label="عبارت cron"
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            placeholder="0 */6 * * *"
            dir="ltr"
            className="ltr:text-left"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {CRON_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setCron(p.value)}
                className="text-[11px] rounded-full border border-slate-200 px-2 py-0.5 text-slate-500 hover:bg-slate-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="منطقهٔ زمانی"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Asia/Tehran"
            dir="ltr"
            className="ltr:text-left"
          />
          <div className="flex flex-col">
            <label className="font-medium mb-2 text-slate-700">نوع کراول</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as CrawlJobType)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            >
              <option value={CrawlJobType.INCREMENTAL}>افزایشی</option>
              <option value={CrawlJobType.FULL_SCAN}>کامل</option>
            </select>
          </div>
          <Input
            label="حداکثر آگهی"
            type="number"
            value={maxItems}
            onChange={(e) => setMaxItems(e.target.value)}
            min={1}
          />
          <Input
            label="عمق اسکرول"
            type="number"
            value={maxScrolls}
            onChange={(e) => setMaxScrolls(e.target.value)}
            placeholder="پیش‌فرض"
            min={1}
            max={50}
          />
          <Input
            label="تأخیر بین آگهی (ms)"
            type="number"
            value={crawlDelayMs}
            onChange={(e) => setCrawlDelayMs(e.target.value)}
            placeholder="پیش‌فرض"
            min={0}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <div className="text-slate-400">اجرای بعدی</div>
            <div>{data?.enabled ? fmt(data?.nextRunAt) : '—'}</div>
          </div>
          <div>
            <div className="text-slate-400">آخرین اجرا</div>
            <div>{fmt(data?.lastRunAt)}</div>
          </div>
          <div>
            <div className="text-slate-400">آخرین کار</div>
            <div>{data?.lastJobId ? `#${data.lastJobId}` : '—'}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={upsert.isLoading || !cron.trim()}>
            {upsert.isLoading ? 'در حال ذخیره...' : 'ذخیره زمان‌بندی'}
          </Button>
          <Button variant="outline" onClick={handleRun} disabled={runNow.isLoading}>
            <IconClockPlay className="size-4 ml-1" />
            اجرای فوری
          </Button>
          {data && (
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={remove.isLoading}
              className="text-rose-600"
            >
              <IconTrash className="size-4 ml-1" />
              حذف
            </Button>
          )}
        </div>

        {hint && <div className="text-[12px] text-slate-500">{hint}</div>}
      </div>
    </Modal>
  );
}
