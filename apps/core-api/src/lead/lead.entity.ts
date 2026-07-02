import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CLOSED = 'closed',
}

@Entity()
export class LeadEntity extends BaseEntity {
  @Property()
  name: string;

  @Property()
  phone: string;

  @Property({ nullable: true })
  businessName?: string;

  @Property({ nullable: true })
  service?: string;

  @Property({ nullable: true })
  businessType?: string;

  @Property({ nullable: true })
  businessSize?: string;

  @Property({ nullable: true, type: 'text' })
  message?: string;

  @Property({ default: LeadStatus.NEW })
  status: LeadStatus = LeadStatus.NEW;
}
