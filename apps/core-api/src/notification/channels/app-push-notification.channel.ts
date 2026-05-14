import { Injectable } from '@nestjs/common';
import { BaseNotificationChannel } from './base-notification.channel';
import { NotificationEntity } from '../notification.entity';
import { NotificationType } from '../notification.constants';
import { NotificationRepository } from '../repositories/notification.repository';

/**
 * App push notification channel
 * This is a placeholder implementation - you'll need to integrate with FCM/APNS
 */
@Injectable()
export class AppPushNotificationChannel extends BaseNotificationChannel {
  // Type getter for better type inference
  get type(): NotificationType {
    return NotificationType.APP_PUSH;
  }

  constructor(protected notificationRepository: NotificationRepository) {
    super(notificationRepository);
  }

  canHandle(notification: NotificationEntity): boolean {
    return (
      notification.type === NotificationType.APP_PUSH &&
      !!notification.metadata?.deviceToken
    );
  }

  async send(notification: NotificationEntity): Promise<void> {
    const deviceToken = notification.metadata?.deviceToken;

    if (!deviceToken) {
      throw new Error('Push notification missing device token');
    }

    // TODO: Implement push notification logic using FCM/APNS
    // Example: await this.pushService.sendPush(deviceToken, notification.message);
    console.log(
      `Sending push notification to ${deviceToken}: ${notification.message}`,
    );

    // For now, just simulate push sending
    // Replace this with actual push service integration
  }

  getPriority(): number {
    return 4; // Highest priority for app push notifications
  }
}
