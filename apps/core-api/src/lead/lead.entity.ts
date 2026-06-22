import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { RealEstateAdvertisementEntity } from '../real-estate/advertisement.entity';
import { UserEntity } from '../user/user.entity';
import { LeadPoolEntity } from './lead-pool.entity';
import { LeadSource, LeadStatus } from './lead.constants';

/**
 * An inbound inquiry attributed to a listing. Created manually by staff in M1;
 * assigned to an agent (directly or via a {@link LeadPoolEntity}) and tracked
 * through the {@link LeadStatus} pipeline to conversion.
 */
@Entity()
export class LeadEntity extends BaseEntity {
  /** The listing this inquiry is about. */
  @ManyToOne(() => RealEstateAdvertisementEntity)
  advertisement: RealEstateAdvertisementEntity;

  /** Agent currently responsible. Null while in a pool / unassigned. */
  @ManyToOne(() => UserEntity, { nullable: true })
  @Index()
  assignedAgent?: UserEntity;

  /** Shared pool the lead sits in while unassigned. */
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
