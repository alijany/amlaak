import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';
import { AgencyEntity } from 'src/agency/agency.entity';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { UserEntity } from 'src/user/user.entity';
import { Role } from './roles.constants';
export enum InvitationStatus {
  PENDING = 'pending',
  AWAITING_PROFILE_COMPLETION = 'awaiting_profile_completion',
  ACCEPTED = 'accepted',
}

@Entity()
export class RolesEntity extends BaseEntity {
  @Enum({ items: () => Role, default: Role.USER })
  role: Role;

  @Property({ nullable: true })
  description?: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  /**
   * The agency this role applies to. Null for platform-level roles
   * (ADMIN / unaffiliated USER); set for agency roles (OWNER/MANAGER/MEMBER).
   */
  @ManyToOne(() => AgencyEntity, { nullable: true })
  @Index()
  agency?: AgencyEntity;

  @Enum({ items: () => InvitationStatus, default: InvitationStatus.PENDING })
  invitationStatus: InvitationStatus = InvitationStatus.PENDING;
}
