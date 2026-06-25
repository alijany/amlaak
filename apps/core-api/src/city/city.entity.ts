import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';

@Entity()
export class CityEntity extends BaseEntity {
  @Property()
  nameFa: string;

  @Property({ nullable: true })
  nameEn?: string;

  @Property()
  @Unique()
  slug: string;

  @Property({ default: 0 })
  order: number = 0;

  @Property({ default: true })
  isActive: boolean = true;
}
