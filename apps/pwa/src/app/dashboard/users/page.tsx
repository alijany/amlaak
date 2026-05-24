'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { DataView, Pagination } from '@/ui/molecules';
import { useState } from 'react';
import { useUsers } from './users.api';
import { AddUserForm } from './users.component.add-user';
import { UserFilterDto } from './users.types';

export default function UsersPage() {
    const [filters, setFilters] = useState<UserFilterDto>({});

    const { data, error, isLoading, refresh } = useUsers(filters);

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page: page - 1 }));
    };

    return (
        <RoleProtectedRoute allowedRoles={RouteItems.users.roles}>
            <DashbaordLayout>
                <div className='space-y-3 grow flex flex-col overflow-hidden'>
                    <div className='p-4 rounded-2xl bg-white flex items-center gap-4 justify-between'>
                        <div className='font-bold grow'>مدیریت کاربران</div>
                        <div>
                            <AddUserForm onSuccess={refresh} />
                        </div>
                    </div>
                    <div className='p-4 rounded-2xl bg-white grow flex flex-col overflow-hidden'>
                        <DataView
                            data={data}
                            error={error}
                            isLoading={isLoading}
                            className='overflow-auto flex flex-col gap-4'
                            emptyMessage='هیچ کاربری در آژانس شما وجود ندارد'
                            isEmpty={(data) => !data?.items.length}
                            onRetry={refresh}
                        >
                            {data?.items?.map((user) => (
                                <div
                                    key={user.id}
                                    className="px-3 py-2.5 rounded-2xl border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-slate-400">{user.name ?? 'بدون نام'}</h3>
                                        <div className="font-semibold text-slate-500">{user.phone ?? 'بدون شماره'}</div>
                                    </div>

                                    <div className='flex items-center flex-wrap justify-end gap-2'>
                                        {user.roles.map((role) => (
                                            <div
                                                key={role}
                                                className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold"
                                            >
                                                {role}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {data?.meta && (
                                <div className="pt-6">
                                    <Pagination
                                        itemPerPage={filters.limit || 10}
                                        page={(filters.page || 0) + 1} // Convert 0-based to 1-based for display
                                        totalCount={data.meta.total}
                                        onNavigate={(page) => {
                                            handlePageChange(page);
                                            return '#';
                                        }}
                                    />
                                </div>
                            )}
                        </DataView>
                    </div>
                </div>
            </DashbaordLayout>
        </RoleProtectedRoute>
    );
}
