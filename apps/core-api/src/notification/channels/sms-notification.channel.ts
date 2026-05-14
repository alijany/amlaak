import { Injectable } from '@nestjs/common';
import { BaseNotificationChannel } from './base-notification.channel';
import { NotificationEntity } from '../notification.entity';
import { NotificationType } from '../notification.constants';
import { SmsService } from '../../sms/sms.service';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class SmsNotificationChannel extends BaseNotificationChannel {
  // Type getter for better type inference
  get type(): NotificationType {
    return NotificationType.SMS;
  }

  constructor(
    protected notificationRepository: NotificationRepository,
    private smsService: SmsService,
  ) {
    super(notificationRepository);
  }

  canHandle(notification: NotificationEntity): boolean {
    return (
      notification.type === NotificationType.SMS &&
      !!notification.recipientPhone
    );
  }

  async send(notification: NotificationEntity): Promise<void> {
    if (!notification.recipientPhone) {
      throw new Error('SMS notification missing recipient phone number');
    }

    await this.smsService.sendSms(
      notification.message,
      notification.recipientPhone,
    );
  }

  getPriority(): number {
    return 2; // Higher priority for SMS
  }
}
