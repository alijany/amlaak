import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventTypes } from '../../events/types';
import { NotificationGetDto } from '../dtos/notification.get.dto';
import { NotificationStatus } from '../notification.constants';
import { NotificationEntity } from '../notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import {
  AdminNotificationRequest,
  DirectNotificationRequest,
  LogNotificationRequest,
  NotificationRequest,
  UserNotificationRequest,
} from '../types/notification-request.types';
import { NotificationDispatcherService } from './notification-dispatcher.service';

/**
 * Main notification service - provides high-level interface for notification management
 * This service acts as a facade, delegating complex operations to specialized services
 */
@Injectable()
export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private notificationDispatcher: NotificationDispatcherService,
  ) {}

  /**
   * Event listener for legacy NotificationRequest
   * Converts legacy events to new request format for backward compatibility
   */
  @OnEvent(EventTypes.SEND_NOTIFICATION, { async: true })
  async handleSendNotification(
    eventData: NotificationRequest | NotificationRequest[],
  ): Promise<NotificationEntity[]> {
    const events = Array.isArray(eventData) ? eventData : [eventData];
    const allNotifications: NotificationEntity[] = [];

    for (const event of events) {
      try {
        const notifications = await this.notificationDispatcher.dispatch(event);
        allNotifications.push(...notifications);
      } catch (error) {
        console.error('Error processing notification event:', error);
      }
    }

    return allNotifications;
  }

  /**
   * Send notification using new request format
   */
  async sendNotification(
    request: NotificationRequest,
  ): Promise<NotificationEntity[]> {
    return this.notificationDispatcher.dispatch(request);
  }

  /**
   * Send notification to a specific user with auto-channel detection
   */
  async sendToUser(
    userId: number,
    message: string,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      metadata?: Record<string, any>;
      smsMessage?: string;
      preferredChannels?: string[];
    },
  ): Promise<NotificationEntity[]> {
    const request: UserNotificationRequest = {
      userId,
      message,
      autoDetectChannels: true,
      priority: options?.priority,
      metadata: options?.metadata,
      smsMessage: options?.smsMessage,
    };

    return this.notificationDispatcher.dispatch(request);
  }

  /**
   * Send notification to all admin users
   */
  async sendToAdmins(
    message: string,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      metadata?: Record<string, any>;
    },
  ): Promise<NotificationEntity[]> {
    const request: AdminNotificationRequest = {
      sendToAdmins: true,
      message,
      priority: options?.priority,
      metadata: options?.metadata,
    };

    return this.notificationDispatcher.dispatch(request);
  }

  /**
   * Send notification to log monitoring system
   */
  async sendToLog(
    message: string,
    logLevel: 'info' | 'warn' | 'error',
    options?: {
      metadata?: Record<string, any>;
    },
  ): Promise<NotificationEntity[]> {
    const request: LogNotificationRequest = {
      message,
      logLevel,
      metadata: options?.metadata,
    };

    return this.notificationDispatcher.dispatch(request);
  }

  /**
   * Send notification to specific channels
   */
  async sendToChannels(
    message: string,
    channels: Array<{
      type: string;
      recipientPhone?: string;
      recipientChatId?: number;
      message?: string;
    }>,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      metadata?: Record<string, any>;
    },
  ): Promise<NotificationEntity[]> {
    const request: DirectNotificationRequest = {
      message,
      channels: channels as any, // Type assertion for compatibility
      priority: options?.priority,
      metadata: options?.metadata,
    };

    return this.notificationDispatcher.dispatch(request);
  }

  /**
   * Get paginated notifications for a user
   */
  async getPaginatedNotifications(
    filterDto: NotificationGetDto,
    userId: number,
  ): Promise<{
    items: NotificationEntity[];
    meta: {
      page: number;
      limit: number;
      total: number;
      pageCount: number;
    };
  }> {
    return this.notificationRepository.findPaginated(filterDto, userId);
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<NotificationEntity | null> {
    return this.notificationRepository.findById(id);
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      user: userId,
      isRead: false,
    });
    return { count };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new Error(
        `Notification with ID ${notificationId} not found for user ${userId}`,
      );
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepository.persistAndFlush(notification);

    return notification;
  }

  /**
   * Mark a notification as unread
   */
  async markAsUnread(
    notificationId: number,
    userId: number,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new Error(
        `Notification with ID ${notificationId} not found for user ${userId}`,
      );
    }

    notification.isRead = false;
    notification.readAt = undefined;
    await this.notificationRepository.persistAndFlush(notification);

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<{ updated: number }> {
    const [notifications] = await this.notificationRepository.findAll(
      { user: userId, isRead: false },
      {},
    );

    const now = new Date();
    notifications.forEach((notification) => {
      notification.isRead = true;
      notification.readAt = now;
    });

    await this.notificationRepository.persistAndFlush(notifications);

    return { updated: notifications.length };
  }

  /**
   * Update notification status (for internal use)
   */
  async updateStatus(
    id: number,
    status: NotificationStatus,
    sentAt?: Date,
    errorMessage?: string,
  ): Promise<void> {
    return this.notificationRepository.updateStatus(
      id,
      status,
      sentAt,
      errorMessage,
    );
  }
}
