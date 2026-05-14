import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

/**
 * Represents the base entity for the ORM.
 */
@Entity({ abstract: true })
export class BaseEntity<OptionalProps extends string = undefined> {
  /**
   * Marks the properties that are optional.
   */
  [OptionalProps]?: 'updated_at' | 'created_at' | OptionalProps;

  /**
   * The primary key of the entity.
   */
  @PrimaryKey()
  id: number;

  /**
   * The timestamp when the entity was created.
   */
  @Property({ type: 'timestamp', onCreate: () => new Date() })
  created_at: Date;

  /**
   * The timestamp when the entity was last updated.
   */
  @Property({
    type: 'timestamp',
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  updated_at: Date;
}
