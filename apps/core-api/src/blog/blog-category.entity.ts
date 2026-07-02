import {
  Collection,
  Entity,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { BlogPostEntity } from './blog-post.entity';

@Entity()
export class BlogCategoryEntity extends BaseEntity {
  @Property()
  @Unique()
  name: string;

  @Property()
  @Unique()
  slug: string;

  @ManyToMany(() => BlogPostEntity, (post) => post.categories)
  posts = new Collection<BlogPostEntity>(this);
}
