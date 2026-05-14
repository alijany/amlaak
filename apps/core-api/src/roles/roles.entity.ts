import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
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

  @Enum({ items: () => InvitationStatus, default: InvitationStatus.PENDING })
  invitationStatus: InvitationStatus = InvitationStatus.PENDING;
}
