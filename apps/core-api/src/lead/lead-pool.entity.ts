import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { LeadPoolAgencyEntity } from './lead-pool-agency.entity';

/**
 * A shared lead pool (queue). All pools are cross-agency: member agencies are
 * tracked via {@link LeadPoolAgencyEntity}. Agents claim leads out of pools;
 * on claim the lead transfers ownership to the claiming agent's agency.
 */
@Entity()
export class LeadPoolEntity extends BaseEntity {
  @Property()
  name: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @OneToMany(() => LeadPoolAgencyEntity, (lpa) => lpa.pool)
  agencies = new Collection<LeadPoolAgencyEntity>(this);
}
