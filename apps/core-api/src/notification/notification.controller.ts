import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  formPipes,
  validationPipes,
} from '../libs/error/error.pipe.validation';
import { UserEntity } from '../user/user.entity';
import {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
} from './dtos/notification-preference.dto';
import { NotificationGetDto } from './dtos/notification.get.dto';
import { NotificationCategory } from './notification.constants';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationService } from './services/notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotifications(
    @Query(...validationPipes) filterDto: NotificationGetDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationService.getPaginatedNotifications(
      filterDto,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: UserEntity) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/unread')
  async markAsUnread(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationService.markAsUnread(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-all-read')
  async markAllAsRead(@CurrentUser() user: UserEntity) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@CurrentUser() user: UserEntity) {
    return this.notificationPreferenceService.getUserPreferences(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  async createPreference(
    @Body(...formPipes) dto: CreateNotificationPreferenceDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationPreferenceService.createPreference(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences/:category')
  async updatePreference(
    @Param('category') category: NotificationCategory,
    @Body(...formPipes) dto: UpdateNotificationPreferenceDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationPreferenceService.updatePreference(
      user.id,
      category,
      dto,
    );
  }
}
