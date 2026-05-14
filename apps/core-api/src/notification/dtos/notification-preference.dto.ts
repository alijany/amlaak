import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { NotificationCategory } from '../notification.constants';

export class CreateNotificationPreferenceDto {
  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  appPushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  telegramEnabled?: boolean;
}

export class UpdateNotificationPreferenceDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  appPushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  telegramEnabled?: boolean;
}
