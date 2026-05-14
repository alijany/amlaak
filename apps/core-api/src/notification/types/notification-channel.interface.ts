import { NotificationEntity } from '../notification.entity';
import { NotificationType } from '../notification.constants';

/**
 * Interface for notification delivery strategies
 */
export interface INotificationChannel {
  /**
   * The type of notification this channel handles
   */
  readonly type: NotificationType;

  /**
   * Check if this channel can handle the given notification
   */
  canHandle(notification: NotificationEntity): boolean;

  /**
   * Send the notification through this channel
   */
  send(notification: NotificationEntity): Promise<void>;

  /**
   * Get the priority of this channel (higher number = higher priority)
   * Used when multiple channels can handle the same notification type
   */
  getPriority(): number;
}
