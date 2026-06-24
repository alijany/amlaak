import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { AgencyEntity } from '../agency/agency.entity';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { LeadPoolEntity } from './lead-pool.entity';

/** Junction: which agencies are members of a shared lead pool. */
@Entity()
@Unique({ properties: ['pool', 'agency'] })
export class LeadPoolAgencyEntity extends BaseEntity {
  @ManyToOne(() => LeadPoolEntity)
  @Index()
  pool: LeadPoolEntity;

  @ManyToOne(() => AgencyEntity)
  @Index()
  agency: AgencyEntity;

  @Property({ type: 'timestamp' })
  addedAt: Date = new Date();
}
