import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '../notification.entity';
import {
  NotificationStatus,
  NotificationType,
} from '../notification.constants';
import { INotificationChannel } from '../types/notification-channel.interface';
import { NotificationRepository } from '../repositories/notification.repository';

/**
 * Abstract base class for notification channels
 * Provides common functionality for status updates and error handling
 */
@Injectable()
export abstract class BaseNotificationChannel implements INotificationChannel {
  constructor(protected notificationRepository: NotificationRepository) {}
  // Type getter for better type inference
  abstract get type(): NotificationType;

  abstract canHandle(notification: NotificationEntity): boolean;
  abstract send(notification: NotificationEntity): Promise<void>;

  getPriority(): number {
    return 1; // Default priority
  }

  /**
   * Template method for sending notifications with error handling
   */
  async sendWithErrorHandling(notification: NotificationEntity): Promise<void> {
    try {
      await this.send(notification);
      await this.markAsSent(notification.id);
    } catch (error) {
      await this.markAsFailed(notification.id, error.message);
      throw error;
    }
  }

  /**
   * Mark notification as sent
   */
  protected async markAsSent(notificationId: number): Promise<void> {
    await this.notificationRepository.updateStatus(
      notificationId,
      NotificationStatus.SENT,
      new Date(),
    );
  }

  /**
   * Mark notification as failed
   */
  protected async markAsFailed(
    notificationId: number,
    errorMessage: string,
  ): Promise<void> {
    await this.notificationRepository.updateStatus(
      notificationId,
      NotificationStatus.FAILED,
      undefined,
      errorMessage,
    );
  }

  /**
   * Mark notification as delivered (for channels that support delivery confirmation)
   */
  protected async markAsDelivered(notificationId: number): Promise<void> {
    await this.notificationRepository.updateStatus(
      notificationId,
      NotificationStatus.DELIVERED,
      new Date(),
    );
  }
}
