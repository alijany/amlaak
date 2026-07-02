'use client';

import { useAuth } from '@/components/auth/auth.context.provider';
import { Role, getRoleName } from '@/components/auth/auth.constants.roles';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { useBlogPosts } from './blog/blog.api';
import { useLeads } from './leads/leads.api';
import { useUnreadCount, useNotifications } from './notifications/notifications.api';
import { useUsers } from './users/users.api';
import { BlogPostStatus } from './blog/blog.types';
import { LeadStatus, LeadStatusLabels, LeadStatusColors } from './leads/leads.types';
import Link from 'next/link';

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = 'slate',
  href,
  icon,
}: {
  label: string;
  value: string | number | undefined;
  sub?: string;
  color?: 'slate' | 'rose' | 'green' | 'amber' | 'blue' | 'indigo';
  href?: string;
  icon: React.ReactNode;
}) {
  const colorMap = {
    slate: 'bg-slate-50 text-slate-600',
    rose: 'bg-rose-50 text-rose-500',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  const card = (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-none">
          {value === undefined ? '—' : value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href} className="block">{card}</Link> : card;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />;
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────

function Ico({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const NewsIco = () => <Ico><path d="M4 4h16v12H4zM4 8h16M8 12h4M8 15h8" /></Ico>;
const LeadIco = () => <Ico><path d="M4 6h16M4 12h8m-8 6h4" /><circle cx="18" cy="18" r="3" /><path d="m21 21-1.5-1.5" /></Ico>;
const BellIco = () => <Ico><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Ico>;
const UsersIco = () => <Ico><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Ico>;
const ChartIco = () => <Ico><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></Ico>;
const PenIco = () => <Ico><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Ico>;
const ArrowIco = () => <Ico size={14}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Ico>;
const CircleIco = () => <Ico size={8}><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /></Ico>;

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, selectedRole, hasAnyRole } = useAuth();

  const isAdminOrManager = hasAnyRole([Role.ADMIN, Role.MANAGER]);
  const isAdmin = hasAnyRole([Role.ADMIN]);

  // Stat counts — fetch minimal pages
  const { data: publishedPosts, isLoading: postsLoading } = useBlogPosts(
    isAdminOrManager ? { limit: 1, status: BlogPostStatus.PUBLISHED } : undefined,
  );
  const { data: draftPosts, isLoading: draftsLoading } = useBlogPosts(
    isAdminOrManager ? { limit: 1, status: BlogPostStatus.DRAFT } : undefined,
  );
  const { data: allLeads, isLoading: leadsLoading } = useLeads(
    isAdminOrManager ? { limit: 1 } : undefined,
  );
  const { data: newLeads } = useLeads(
    isAdminOrManager ? { limit: 1, status: LeadStatus.NEW } : undefined,
  );
  const { data: unread } = useUnreadCount();
  const { data: users, isLoading: usersLoading } = useUsers(
    isAdmin ? { limit: 1 } : undefined,
  );

  // Recent data for activity tables
  const { data: recentPosts } = useBlogPosts(
    isAdminOrManager ? { limit: 5, page: 0 } : undefined,
  );
  const { data: recentLeads } = useLeads(
    isAdminOrManager ? { limit: 5, page: 0 } : undefined,
  );
  const { data: recentNotifs } = useNotifications({ limit: 5, page: 0, isRead: false });

  const displayName = user?.name || user?.firstName || user?.phone || 'کاربر';
  const roleName = selectedRole ? getRoleName(selectedRole.role) : null;

  return (
    <RoleProtectedRoute allowedRoles={RouteItems.dashboard.roles}>
      <DashbaordLayout>
        <div className="flex flex-col gap-4 grow overflow-auto" dir="rtl">

          {/* ── Greeting ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">خوش آمدید</p>
              <h1 className="text-lg font-bold text-slate-800">
                {displayName}
                {roleName && (
                  <span className="mr-2 text-sm font-medium text-slate-400">({roleName})</span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {(unread?.count ?? 0) > 0 && (
                <Link
                  href="/dashboard/notifications"
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100 hover:bg-rose-100 transition-colors"
                >
                  <BellIco />
                  <span>{unread!.count} اعلان خوانده‌نشده</span>
                </Link>
              )}
              <Link
                href="/dashboard/profile"
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                ویرایش پروفایل
              </Link>
            </div>
          </div>

          {/* ── Stats grid ────────────────────────────────────────── */}
          {isAdminOrManager && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="کل سرنخ‌ها"
                value={leadsLoading ? undefined : allLeads?.meta.total}
                sub={newLeads?.meta.total ? `${newLeads.meta.total} جدید` : undefined}
                color="rose"
                href="/dashboard/leads"
                icon={<LeadIco />}
              />
              <StatCard
                label="مقالات منتشرشده"
                value={postsLoading ? undefined : publishedPosts?.meta.total}
                sub={draftsLoading ? undefined : draftPosts?.meta.total ? `${draftPosts.meta.total} پیش‌نویس` : undefined}
                color="indigo"
                href="/dashboard/blog"
                icon={<NewsIco />}
              />
              <StatCard
                label="اعلان‌ها"
                value={unread?.count}
                color="amber"
                href="/dashboard/notifications"
                icon={<BellIco />}
              />
              {isAdmin ? (
                <StatCard
                  label="کاربران"
                  value={usersLoading ? undefined : users?.meta.total}
                  color="green"
                  href="/dashboard/users"
                  icon={<UsersIco />}
                />
              ) : (
                <StatCard
                  label="عملکرد"
                  value="—"
                  sub="نمودار به‌زودی"
                  color="blue"
                  icon={<ChartIco />}
                />
              )}
            </div>
          )}

          {/* ── Content grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Recent leads */}
            {isAdminOrManager && (
              <Section
                title="آخرین سرنخ‌ها"
                action={
                  <Link href="/dashboard/leads" className="flex items-center gap-1 text-xs text-rose-500 font-medium hover:text-rose-700 transition-colors">
                    <span>همه سرنخ‌ها</span><ArrowIco />
                  </Link>
                }
              >
                {!recentLeads ? (
                  <div className="flex flex-col gap-2 p-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
                  </div>
                ) : recentLeads.items.length === 0 ? (
                  <p className="p-5 text-sm text-slate-400 text-center">هیچ سرنخی ثبت نشده است.</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {recentLeads.items.map(lead => (
                      <div key={lead.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
                          <p className="text-xs text-slate-400" dir="ltr">{lead.phone}</p>
                          {lead.service && (
                            <p className="text-xs text-slate-500 truncate">{lead.service}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${LeadStatusColors[lead.status]}`}>
                            {LeadStatusLabels[lead.status]}
                          </span>
                          <span className="text-xs text-slate-300">
                            {new Date(lead.created_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Recent blog posts */}
            {isAdminOrManager && (
              <Section
                title="آخرین مقالات"
                action={
                  <Link href="/dashboard/blog" className="flex items-center gap-1 text-xs text-indigo-500 font-medium hover:text-indigo-700 transition-colors">
                    <span>مدیریت مقالات</span><ArrowIco />
                  </Link>
                }
              >
                {!recentPosts ? (
                  <div className="flex flex-col gap-2 p-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : recentPosts.items.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <p className="text-sm text-slate-400">هنوز مطلبی ایجاد نشده است.</p>
                    <Link
                      href="/dashboard/blog/create"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors"
                    >
                      <PenIco />
                      <span>ایجاد اولین مطلب</span>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {recentPosts.items.map(post => {
                      const statusColor: Record<BlogPostStatus, string> = {
                        [BlogPostStatus.PUBLISHED]: 'text-green-600',
                        [BlogPostStatus.DRAFT]: 'text-amber-500',
                        [BlogPostStatus.SCHEDULED]: 'text-purple-500',
                        [BlogPostStatus.NOINDEX]: 'text-blue-500',
                        [BlogPostStatus.REDIRECT]: 'text-orange-500',
                        [BlogPostStatus.GONE]: 'text-red-400',
                      };
                      const statusLabel: Record<BlogPostStatus, string> = {
                        [BlogPostStatus.PUBLISHED]: 'منتشر',
                        [BlogPostStatus.DRAFT]: 'پیش‌نویس',
                        [BlogPostStatus.SCHEDULED]: 'زمان‌بندی',
                        [BlogPostStatus.NOINDEX]: 'نوایندکس',
                        [BlogPostStatus.REDIRECT]: 'ریدایرکت',
                        [BlogPostStatus.GONE]: '410',
                      };
                      return (
                        <div key={post.id} className="flex items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{post.title}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(post.created_at).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`flex items-center gap-1 text-xs font-medium ${statusColor[post.status]}`}>
                              <CircleIco />{statusLabel[post.status]}
                            </span>
                            <Link
                              href={`/dashboard/blog/${post.id}/edit`}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <PenIco />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>
            )}

            {/* Recent unread notifications */}
            <Section
              title="اعلان‌های اخیر"
              action={
                <Link href="/dashboard/notifications" className="flex items-center gap-1 text-xs text-amber-500 font-medium hover:text-amber-700 transition-colors">
                  <span>همه اعلان‌ها</span><ArrowIco />
                </Link>
              }
            >
              {!recentNotifs ? (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : recentNotifs.items.length === 0 ? (
                <p className="p-5 text-sm text-slate-400 text-center">اعلان خوانده‌نشده‌ای ندارید.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentNotifs.items.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-5 py-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {new Date(n.created_at).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Lead funnel summary */}
            {isAdminOrManager && allLeads && allLeads.meta.total > 0 && (
              <Section title="وضعیت سرنخ‌ها">
                <div className="p-5 flex flex-col gap-3">
                  {(
                    [
                      { status: LeadStatus.NEW, label: LeadStatusLabels[LeadStatus.NEW], color: 'bg-rose-400' },
                      { status: LeadStatus.CONTACTED, label: LeadStatusLabels[LeadStatus.CONTACTED], color: 'bg-amber-400' },
                      { status: LeadStatus.CLOSED, label: LeadStatusLabels[LeadStatus.CLOSED], color: 'bg-green-400' },
                    ] as const
                  ).map(({ status, label, color }) => {
                    const count = status === LeadStatus.NEW ? (newLeads?.meta.total ?? 0) : undefined;
                    const total = allLeads.meta.total;
                    const pct = count !== undefined ? Math.round((count / total) * 100) : null;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1 text-xs text-slate-600">
                          <span className="font-medium">{label}</span>
                          <span>{count !== undefined ? `${count} از ${total}` : '—'}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          {pct !== null && (
                            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

          </div>

          {/* ── Quick actions ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">دسترسی سریع</h2>
            <div className="flex flex-wrap gap-2">
              {isAdminOrManager && (
                <Link href="/dashboard/blog/create" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
                  <PenIco />مطلب جدید
                </Link>
              )}
              {isAdminOrManager && (
                <Link href="/dashboard/leads" className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors">
                  <LeadIco />مدیریت سرنخ‌ها
                </Link>
              )}
              <Link href="/dashboard/notifications" className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">
                <BellIco />اعلان‌ها
                {(unread?.count ?? 0) > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {unread!.count}
                  </span>
                )}
              </Link>
              <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                پروفایل
              </Link>
              {isAdmin && (
                <Link href="/dashboard/users" className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
                  <UsersIco />کاربران
                </Link>
              )}
            </div>
          </div>

        </div>
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
