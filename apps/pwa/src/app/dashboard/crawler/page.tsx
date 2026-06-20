'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { DataView } from '@/ui/molecules';
import { IconRefresh } from '@tabler/icons-react';
import { Button } from '@/ui/atoms';
import { useCrawlTargets } from './crawler.api';
import { BrowserStatus } from './crawler.component.browser-status';
import { JobList } from './crawler.component.job-list';
import { TargetCard } from './crawler.component.target-card';

export default function CrawlerPage() {
  const { data, error, isLoading, refresh } = useCrawlTargets();

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.crawler.roles}>
      <DashbaordLayout>
        <div className="space-y-3 grow flex flex-col overflow-hidden">
          <div className="p-4 rounded-2xl bg-white flex items-center gap-4 justify-between">
            <div>
              <div className="font-bold">مدیریت خزنده‌ها</div>
              <div className="text-[12px] text-slate-400">
                پایش وضعیت سایت‌های هدف، احراز هویت و اجرای کراول
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BrowserStatus />
              <Button variant="outline" size="sm" onClick={refresh}>
                <IconRefresh className="size-4 ml-1" />
                بروزرسانی
              </Button>
            </div>
          </div>

          <div className="grow overflow-auto flex flex-col gap-4">
            <DataView
              data={data}
              error={error}
              isLoading={isLoading}
              className="grid grid-cols-1 lg:grid-cols-2 gap-3"
              isEmpty={(d) => !d?.items.length}
              emptyMessage="هیچ سایت هدفی ثبت نشده است."
              onRetry={refresh}
            >
              {data?.items?.map((target) => (
                <TargetCard key={target.id} target={target} onRefresh={refresh} />
              ))}
            </DataView>

            <div className="p-4 rounded-2xl bg-white flex flex-col gap-3">
              <div className="font-semibold text-slate-600 text-sm">
                کراول‌های اخیر
              </div>
              <JobList />
            </div>
          </div>
        </div>
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
