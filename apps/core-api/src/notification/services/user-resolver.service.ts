import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { UserService } from 'src/user/user.service';
import { Role } from '../../roles/roles.constants';
import { RolesService } from '../../roles/roles.service';
import { UserEntity } from '../../user/user.entity';
import { NotificationType } from '../notification.constants';
import { NotificationEntity } from '../notification.entity';
import { IUserResolver } from '../types/user-resolver.interface';

@Injectable()
export class UserResolverService
  extends BaseRepositoryService<NotificationEntity>
  implements IUserResolver
{
  constructor(
    private rolesService: RolesService,
    private readonly userService: UserService,
    @InjectRepository(NotificationEntity)
    repository: EntityRepository<NotificationEntity>,
  ) {
    super(repository);
  }

  async getUserById(userId: number): Promise<UserEntity | null> {
    return this.userService.findOne({ id: userId });
  }

  async getAdminUsers(): Promise<UserEntity[]> {
    try {
      const adminRoles = await this.rolesService.findAll(
        { role: Role.ADMIN },
        { populate: ['user'] as never },
      );

      return adminRoles[0].map((role) => role.user);
    } catch (error) {
      // Log error and return empty array to prevent service failures
      console.error('Failed to fetch admin users:', error);
      return [];
    }
  }

  async getAvailableChannels(user: UserEntity): Promise<NotificationType[]> {
    const channels: NotificationType[] = [];

    // SMS channel if user has phone
    if (user.phone) {
      channels.push(NotificationType.SMS);
    }

    // Telegram channels if user has chatId
    if (user.chatId) {
      channels.push(NotificationType.TELEGRAM_BOT);
      // Add other bot types based on user roles if needed
      // This could be extended to check user roles for specific bot access
    }

    // Email channel if user has email (assuming email field exists or will be added)
    // if (user.email) {
    //   channels.push(NotificationType.EMAIL);
    // }

    // App push notifications (when implemented)
    // if (user.deviceToken) {
    //   channels.push(NotificationType.APP_PUSH);
    // }

    return channels;
  }

  async hasChannel(
    user: UserEntity,
    channel: NotificationType,
  ): Promise<boolean> {
    const availableChannels = await this.getAvailableChannels(user);
    return availableChannels.includes(channel);
  }
}
