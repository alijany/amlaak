import { Injectable } from '@nestjs/common';
import { BaseNotificationChannel } from './base-notification.channel';
import { NotificationEntity } from '../notification.entity';
import { NotificationType } from '../notification.constants';
import { NotificationRepository } from '../repositories/notification.repository';

/**
 * Email notification channel
 * This is a placeholder implementation - you'll need to integrate with your email service
 */
@Injectable()
export class EmailNotificationChannel extends BaseNotificationChannel {
  // Type getter for better type inference
  get type(): NotificationType {
    return NotificationType.EMAIL;
  }

  constructor(protected notificationRepository: NotificationRepository) {
    super(notificationRepository);
  }

  canHandle(notification: NotificationEntity): boolean {
    return (
      notification.type === NotificationType.EMAIL &&
      !!notification.metadata?.recipientEmail
    );
  }

  async send(notification: NotificationEntity): Promise<void> {
    const recipientEmail = notification.metadata?.recipientEmail;

    if (!recipientEmail) {
      throw new Error('Email notification missing recipient email address');
    }

    // TODO: Implement email sending logic
    // Example: await this.emailService.sendEmail(recipientEmail, notification.message);
    console.log(`Sending email to ${recipientEmail}: ${notification.message}`);

    // For now, just simulate email sending
    // Replace this with actual email service integration
  }

  getPriority(): number {
    return 1; // Lower priority for email
  }
}
