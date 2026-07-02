import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { UserEntity } from 'src/user/user.entity';
import { BlogCategoryEntity } from './blog-category.entity';

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  GONE = 'gone',
  REDIRECT = 'redirect',
  SCHEDULED = 'scheduled',
  NOINDEX = 'noindex',
}

@Entity()
export class BlogPostEntity extends BaseEntity {
  @Property()
  title: string;

  @Property()
  @Unique()
  slug: string;

  @Property({ type: 'text' })
  body: string;

  @Property({ nullable: true, type: 'text' })
  excerpt?: string;

  @Property({ nullable: true })
  coverImage?: string;

  @Property({ nullable: true })
  metaTitle?: string;

  @Property({ nullable: true, type: 'text' })
  metaDescription?: string;

  @Property({ nullable: true })
  ogImage?: string;

  @Property({ default: BlogPostStatus.DRAFT })
  status: BlogPostStatus = BlogPostStatus.DRAFT;

  @Property({ nullable: true })
  redirectUrl?: string;

  @Property({ nullable: true, type: 'timestamp' })
  publishAt?: Date;

  @ManyToOne(() => UserEntity)
  author: UserEntity;

  @ManyToMany(() => BlogCategoryEntity, (cat) => cat.posts, { owner: true })
  categories = new Collection<BlogCategoryEntity>(this);

  @Property({ nullable: true, type: 'timestamp' })
  publishedAt?: Date;
}
