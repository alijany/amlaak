import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotificationPreferenceEntity } from '../notification-preference.entity';
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
} from '../dtos/notification-preference.dto';
import { NotificationCategory } from '../notification.constants';

@Injectable()
export class NotificationPreferenceService extends BaseRepositoryService<NotificationPreferenceEntity> {
  constructor(
    @InjectRepository(NotificationPreferenceEntity)
    protected preferenceRepository: NotificationPreferenceRepository,
  ) {
    super(preferenceRepository);
  }

  async getUserPreferences(
    userId: number,
  ): Promise<NotificationPreferenceEntity[]> {
    const preferences = await this.preferenceRepository.find({ user: userId });
    // If preferences do not exist for user (e.g., newly created user), initialize default preferences
    if (!preferences || preferences.length === 0) {
      await this.initializeDefaultPreferences(userId);
      return this.preferenceRepository.find({ user: userId });
    }
    return preferences;
  }

  async getPreferenceByCategory(
    userId: number,
    category: NotificationCategory,
  ): Promise<NotificationPreferenceEntity | null> {
    return this.preferenceRepository.findOne({ user: userId, category });
  }

  async createPreference(
    userId: number,
    dto: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    const preference = this.preferenceRepository.create({
      user: userId,
      category: dto.category,
      enabled: dto.enabled ?? true,
      smsEnabled: dto.smsEnabled ?? true,
      emailEnabled: dto.emailEnabled ?? true,
      appPushEnabled: dto.appPushEnabled ?? true,
      telegramEnabled: dto.telegramEnabled ?? true,
    });

    await this.em.persistAndFlush(preference);
    return preference;
  }

  async updatePreference(
    userId: number,
    category: NotificationCategory,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    let preference = await this.getPreferenceByCategory(userId, category);

    if (!preference) {
      // Create default preference if it doesn't exist
      preference = this.preferenceRepository.create({
        user: userId,
        category,
        enabled: true,
        smsEnabled: true,
        emailEnabled: true,
        appPushEnabled: true,
        telegramEnabled: true,
      });
    }

    if (dto.enabled !== undefined) {
      preference.enabled = dto.enabled;
    }
    if (dto.smsEnabled !== undefined) {
      preference.smsEnabled = dto.smsEnabled;
    }
    if (dto.emailEnabled !== undefined) {
      preference.emailEnabled = dto.emailEnabled;
    }
    if (dto.appPushEnabled !== undefined) {
      preference.appPushEnabled = dto.appPushEnabled;
    }
    if (dto.telegramEnabled !== undefined) {
      preference.telegramEnabled = dto.telegramEnabled;
    }

    await this.em.persistAndFlush(preference);
    return preference;
  }

  async initializeDefaultPreferences(userId: number): Promise<void> {
    const categories = Object.values(NotificationCategory);

    for (const category of categories) {
      const exists = await this.getPreferenceByCategory(userId, category);
      if (!exists) {
        await this.createPreference(userId, {
          category,
          enabled: true,
          smsEnabled: true,
          emailEnabled: true,
          appPushEnabled: true,
          telegramEnabled: true,
        });
      }
    }
  }

  async isNotificationEnabled(
    userId: number,
    category: NotificationCategory,
    channelType: 'sms' | 'email' | 'app_push' | 'telegram',
  ): Promise<boolean> {
    const preference = await this.getPreferenceByCategory(userId, category);

    if (!preference || !preference.enabled) {
      return false;
    }

    switch (channelType) {
      case 'sms':
        return preference.smsEnabled;
      case 'email':
        return preference.emailEnabled;
      case 'app_push':
        return preference.appPushEnabled;
      case 'telegram':
        return preference.telegramEnabled;
      default:
        return true;
    }
  }
}
