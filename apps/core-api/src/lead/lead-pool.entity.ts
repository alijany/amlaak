import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';

/**
 * A shared lead pool (queue). Unassigned leads can be routed to a pool; agents
 * claim leads out of pools. Pools are managed by managers/admins.
 */
@Entity()
export class LeadPoolEntity extends BaseEntity {
  @Property()
  @Unique()
  name: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ default: true })
  isActive: boolean = true;
}
