import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';
import { AgencyEntity } from '../agency/agency.entity';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { RealEstateAdvertisementEntity } from '../real-estate/advertisement.entity';
import { LeadPoolEntity } from './lead-pool.entity';
import { LeadSource, LeadStatus } from './lead.constants';

/**
 * An inbound inquiry attributed to a listing. Created manually by staff in M1;
 * assigned to a single agency directly, or placed in a shared
 * {@link LeadPoolEntity} until the first member agency claims it. Tracked
 * through the {@link LeadStatus} pipeline to conversion.
 */
@Entity()
export class LeadEntity extends BaseEntity {
  /** Owning agency (tenant). Null while the lead is unclaimed in a pool. */
  @ManyToOne(() => AgencyEntity, { nullable: true })
  @Index()
  agency?: AgencyEntity;

  /** The listing this inquiry is about. */
  @ManyToOne(() => RealEstateAdvertisementEntity)
  advertisement: RealEstateAdvertisementEntity;

  /** Shared pool the lead sits in while unclaimed by any agency. */
  @ManyToOne(() => LeadPoolEntity, { nullable: true })
  pool?: LeadPoolEntity;

  @Enum({ items: () => LeadStatus, default: LeadStatus.NEW })
  @Index()
  status: LeadStatus = LeadStatus.NEW;

  @Enum({ items: () => LeadSource, default: LeadSource.OTHER })
  source: LeadSource = LeadSource.OTHER;

  /** Tracking code the inquiry referenced (kept for the record). */
  @Property({ nullable: true })
  trackingCode?: string;

  @Property({ nullable: true })
  contactName?: string;

  @Property({ nullable: true })
  contactPhone?: string;

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property({ type: 'timestamp', nullable: true })
  lastContactedAt?: Date;

  @Property({ type: 'timestamp', nullable: true })
  closedAt?: Date;
}
