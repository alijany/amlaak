import {
  Collection,
  Entity,
  OneToMany,
  Property,
  Unique,
  types,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { RolesEntity } from 'src/roles/roles.entity';

export enum UserType {
  INDIVIDUAL = 'individual', // حقیقی
  LEGAL = 'legal', // حقوقی
}

@Entity()
export class UserEntity extends BaseEntity {
  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  // Virtual property for full name
  get name(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || undefined;
  }

  @Property({ nullable: true })
  nationalId?: string;

  // Legal (organization) related details
  @Property({ nullable: true })
  organizationName?: string;

  @Property({ nullable: true })
  organizationRegistrationNumber?: string;

  @Property({ nullable: true })
  organizationNationalId?: string;

  @Property({ nullable: true })
  organizationRepresentative?: string;

  @Property({ nullable: true, type: types.bigint })
  @Unique()
  chatId?: number;

  @Property({ nullable: true })
  @Unique()
  phone?: string;

  @Property({ nullable: true })
  profilePicture?: string;

  @Property({ default: UserType.INDIVIDUAL })
  userType: UserType = UserType.INDIVIDUAL;

  @OneToMany(() => RolesEntity, (role) => role.user)
  roles = new Collection<RolesEntity>(this);
}
