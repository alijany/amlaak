import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '../libs/orm/orm.entity.base';
import { UserEntity } from '../user/user.entity';
import { NotificationCategory } from './notification.constants';

@Entity()
export class NotificationPreferenceEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Enum({ items: () => NotificationCategory })
  category: NotificationCategory;

  @Property({ default: true })
  enabled: boolean;

  @Property({ default: true })
  smsEnabled: boolean;

  @Property({ default: true })
  emailEnabled: boolean;

  @Property({ default: true })
  appPushEnabled: boolean;

  @Property({ default: true })
  telegramEnabled: boolean;
}
