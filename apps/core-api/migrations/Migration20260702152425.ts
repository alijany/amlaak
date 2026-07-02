'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260702152425 extends Migration {

  async up() {
    this.addSql(`create table "blog_category_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "slug" varchar(255) not null);`);
    this.addSql(`alter table "blog_category_entity" add constraint "blog_category_entity_name_unique" unique ("name");`);
    this.addSql(`alter table "blog_category_entity" add constraint "blog_category_entity_slug_unique" unique ("slug");`);

    this.addSql(`create table "blog_post_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "slug" varchar(255) not null, "body" text not null, "excerpt" text null, "cover_image" varchar(255) null, "meta_title" varchar(255) null, "meta_description" text null, "og_image" varchar(255) null, "status" varchar(255) not null default 'draft', "redirect_url" varchar(255) null, "publish_at" timestamptz null, "author_id" int not null, "published_at" timestamptz null);`);
    this.addSql(`alter table "blog_post_entity" add constraint "blog_post_entity_slug_unique" unique ("slug");`);

    this.addSql(`create table "blog_post_entity_categories" ("blog_post_entity_id" int not null, "blog_category_entity_id" int not null, constraint "blog_post_entity_categories_pkey" primary key ("blog_post_entity_id", "blog_category_entity_id"));`);

    this.addSql(`alter table "blog_post_entity" add constraint "blog_post_entity_author_id_foreign" foreign key ("author_id") references "user_entity" ("id") on update cascade;`);

    this.addSql(`alter table "blog_post_entity_categories" add constraint "blog_post_entity_categories_blog_post_entity_id_foreign" foreign key ("blog_post_entity_id") references "blog_post_entity" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "blog_post_entity_categories" add constraint "blog_post_entity_categories_blog_category_entity_id_foreign" foreign key ("blog_category_entity_id") references "blog_category_entity" ("id") on update cascade on delete cascade;`);
  }

  async down() {
    this.addSql(`alter table "blog_post_entity_categories" drop constraint "blog_post_entity_categories_blog_category_entity_id_foreign";`);

    this.addSql(`alter table "blog_post_entity_categories" drop constraint "blog_post_entity_categories_blog_post_entity_id_foreign";`);

    this.addSql(`drop table if exists "blog_category_entity" cascade;`);

    this.addSql(`drop table if exists "blog_post_entity" cascade;`);

    this.addSql(`drop table if exists "blog_post_entity_categories" cascade;`);
  }

}
exports.Migration20260702152425 = Migration20260702152425;
