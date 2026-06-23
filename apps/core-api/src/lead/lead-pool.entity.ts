import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core';
import { AgencyEntity } from '../agency/agency.entity';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';

/**
 * A shared lead pool (queue) within an agency. Unassigned leads can be routed to
 * a pool; agents claim leads out of pools. Managed by agency managers/admins.
 */
@Entity()
export class LeadPoolEntity extends BaseEntity {
  /** Owning agency (tenant). Null only for legacy rows until backfilled. */
  @ManyToOne(() => AgencyEntity, { nullable: true })
  @Index()
  agency?: AgencyEntity;

  @Property()
  name: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ default: true })
  isActive: boolean = true;
}
