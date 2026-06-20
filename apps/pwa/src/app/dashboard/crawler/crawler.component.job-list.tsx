'use client';

import { DataView } from '@/ui/molecules';
import { useCrawlJobs } from './crawler.api';
import { JobStatusPill } from './crawler.component.status-pill';

const JOB_TYPE_LABEL: Record<string, string> = {
  full_scan: 'اسکن کامل',
  incremental: 'افزایشی',
  single_ad: 'تک‌آگهی',
};

/** Recent crawl jobs across all targets (latest first). */
export function JobList() {
  const { data, error, isLoading, refresh } = useCrawlJobs();

  return (
    <DataView
      data={data}
      error={error}
      isLoading={isLoading}
      className="flex flex-col gap-2"
      isEmpty={(d) => !d?.items.length}
      emptyMessage="هنوز کراولی اجرا نشده است."
      onRetry={refresh}
      variant="inline"
    >
      {data?.items?.map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 text-[12px]"
        >
          <div className="flex flex-col">
            <span className="font-semibold text-slate-600">
              {job.target?.name} · {JOB_TYPE_LABEL[job.type] ?? job.type}
            </span>
            <span className="text-slate-400">
              {new Date(job.created_at).toLocaleString('fa-IR')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {job.stats && (
              <span className="text-slate-400">
                {job.stats.found ?? 0} یافت / {job.stats.created ?? 0} جدید
              </span>
            )}
            <JobStatusPill status={job.status} />
          </div>
        </div>
      ))}
    </DataView>
  );
}
