'use client';

import { useState, useRef, useEffect } from 'react';
import { IconBell, IconCircle } from '@tabler/icons-react';
import { Button } from '@/ui/atoms/ui.button';
import { Card, CardHeader, CardContent } from '@/ui/atoms/ui.card';
// Avatar intentionally not used for now: emojis are rendered directly; remove Avatar if unused in future
import { Spinner } from '@/ui/atoms/ui.atoms.spinner';
import { Link } from '@/i18n/i18n.navigation';
import { useNotifications, useUnreadCount, markAsRead, getNotificationsCacheKey } from '@/app/[locale]/dashboard/notifications/notifications.api';
import { NotificationResponse, NotificationCategory } from '@/app/[locale]/dashboard/notifications/notifications.types';
import { useFormatter, useTranslations } from 'next-intl';
import { mutate } from 'swr';

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('dashboard.shell.notifications');
    const format = useFormatter();
    const { data: unreadData } = useUnreadCount();
    const notificationFilters = { limit: 5, page: 0, isRead: false };
    const { data: notificationsData, isLoading: isNotificationsLoading } = useNotifications(notificationFilters);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
        if (!isRead) {
            try {
                await markAsRead(notificationId);
                mutate('/notifications/unread-count');
                mutate(getNotificationsCacheKey(notificationFilters));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
        setIsOpen(false);
    };

    const getCategoryIcon = (category: NotificationCategory) => {
        switch (category) {
            case NotificationCategory.SYSTEM:
                return '🔔';
            case NotificationCategory.GENERAL:
                return '📢';
            default:
                return '📌';
        }
    };

    const unreadCount = unreadData?.count || 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="white"
                className="relative !px-2"
                aria-label={t('title')}
            >
                <IconBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -start-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? t('overflow', { count: 9 }) : format.number(unreadCount)}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute end-0 mt-2 w-80 sm:w-96 z-50">
                    <Card className="bg-white rounded-lg shadow-lg border max-h-[500px] overflow-hidden flex flex-col">
                        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                            <h3 className="font-semibold">{t('title')}</h3>
                            <Link
                                href="/dashboard/notifications"
                                className="text-sm text-blue-600 hover:text-blue-700"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('viewAll')}
                            </Link>
                        </CardHeader>

                        <CardContent className="overflow-y-auto flex-1 p-0">
                            {notificationsData?.items && notificationsData.items.length > 0 ? (
                                <div className="divide-y">
                                    {notificationsData.items.map((notification: NotificationResponse) => (
                                        <Link
                                            key={notification.id}
                                            href={notification.link || '/dashboard/notifications'}
                                            onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                                            className="block p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex gap-3">
                                                <div className="text-2xl flex-shrink-0">
                                                    <div className="rounded-full w-10 h-10 bg-slate-100 flex items-center justify-center text-lg">{getCategoryIcon(notification.category)}</div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <IconCircle size={12} fill="currentColor" className="text-blue-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {format.dateTime(new Date(notification.created_at), 'stamp')}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                isNotificationsLoading ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Spinner size="md" className="mx-auto mb-2" />
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <IconBell size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>{t('empty')}</p>
                                    </div>
                                )
                            )}


                            {notificationsData?.items && notificationsData.items.length > 0 && (
                                <div className="p-3 border-t bg-gray-50">
                                    <Link
                                        href="/dashboard/notifications"
                                        className="block text-center text-sm text-blue-600 hover:text-blue-700"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {t('viewAllNotifications')}
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
