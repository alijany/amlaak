import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';

enum SmsStatusEnum {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

@Entity()
export class SmsEntity extends BaseEntity {
  @Property()
  to: string;

  @Property()
  from: string;

  @Property()
  message: string;

  @Property({ type: 'json' })
  metadata: Record<string, any>;

  @Enum({ items: () => SmsStatusEnum, default: SmsStatusEnum.PENDING })
  status: SmsStatusEnum;
}
