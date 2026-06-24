import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { UserEntity } from 'src/user/user.entity';

/**
 * An Agency is the multi-tenant organization unit. Agency-scoped roles
 * (OWNER = agency owner, MANAGER, MEMBER = agent) reference an agency via
 * RolesEntity.agency; leads, lead pools and listings are owned by an agency.
 *
 * One agency is flagged `isPlatform` — the operator's own agency that owns all
 * crawled listings and pre-existing data.
 */
@Entity()
export class AgencyEntity extends BaseEntity {
  @Property()
  @Index()
  name: string;

  /** URL-safe identifier for the (M4) public agency profile. */
  @Property({ nullable: true })
  @Unique()
  slug?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  logo?: string;

  /** Wide cover image for the public storefront. */
  @Property({ nullable: true })
  banner?: string;

  @Property({ nullable: true })
  website?: string;

  @Property({ nullable: true })
  city?: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ default: true })
  isActive: boolean = true;

  /** The single operator-owned agency that owns crawled/legacy data. */
  @Property({ default: false })
  isPlatform: boolean = false;

  @ManyToOne(() => UserEntity, { nullable: true })
  owner?: UserEntity;
}
