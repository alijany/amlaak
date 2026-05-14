import { NotificationEntity } from '../notification.entity';
import { NotificationGetDto } from '../dtos/notification.get.dto';
import { NotificationStatus } from '../notification.constants';

/**
 * Interface for notification data access
 */
export interface INotificationRepository {
  /**
   * Create a new notification
   */
  create(data: Partial<NotificationEntity>): Promise<NotificationEntity>;

  /**
   * Update notification status
   */
  updateStatus(
    id: number,
    status: NotificationStatus,
    sentAt?: Date,
    errorMessage?: string,
  ): Promise<void>;

  /**
   * Find notifications with pagination
   */
  findPaginated(
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
  }>;

  /**
   * Find notification by ID
   */
  findById(id: number): Promise<NotificationEntity | null>;
}
