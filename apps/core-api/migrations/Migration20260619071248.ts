'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260619071248 extends Migration {
  async up() {
    this.addSql(
      `create table "blog_category_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "slug" varchar(255) not null);`,
    );
    this.addSql(
      `alter table "blog_category_entity" add constraint "blog_category_entity_name_unique" unique ("name");`,
    );
    this.addSql(
      `alter table "blog_category_entity" add constraint "blog_category_entity_slug_unique" unique ("slug");`,
    );

    this.addSql(
      `create table "lead_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "phone" varchar(255) not null, "business_name" varchar(255) null, "service" varchar(255) null, "business_type" varchar(255) null, "business_size" varchar(255) null, "message" text null, "status" varchar(255) not null default 'new');`,
    );

    this.addSql(
      `create table "sms_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "to" varchar(255) not null, "from" varchar(255) not null, "message" varchar(255) not null, "metadata" jsonb not null, "status" text check ("status" in ('pending', 'sent', 'delivered', 'failed')) not null default 'pending');`,
    );

    this.addSql(
      `create table "user_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "first_name" varchar(255) null, "last_name" varchar(255) null, "national_id" varchar(255) null, "organization_name" varchar(255) null, "organization_registration_number" varchar(255) null, "organization_national_id" varchar(255) null, "organization_representative" varchar(255) null, "chat_id" bigint null, "phone" varchar(255) null, "profile_picture" varchar(255) null, "user_type" varchar(255) not null default 'individual');`,
    );
    this.addSql(
      `alter table "user_entity" add constraint "user_entity_chat_id_unique" unique ("chat_id");`,
    );
    this.addSql(
      `alter table "user_entity" add constraint "user_entity_phone_unique" unique ("phone");`,
    );

    this.addSql(
      `create table "roles_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "role" text check ("role" in ('admin', 'owner', 'manager', 'member', 'user', 'guest')) not null default 'user', "description" varchar(255) null, "user_id" int not null, "invitation_status" text check ("invitation_status" in ('pending', 'awaiting_profile_completion', 'accepted')) not null default 'pending');`,
    );

    this.addSql(
      `create table "notification_preference_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" int not null, "category" text check ("category" in ('system', 'general')) not null, "enabled" boolean not null default true, "sms_enabled" boolean not null default true, "email_enabled" boolean not null default true, "app_push_enabled" boolean not null default true, "telegram_enabled" boolean not null default true);`,
    );

    this.addSql(
      `create table "notification_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" int null, "recipient_phone" varchar(255) null, "recipient_chat_id" bigint null, "type" text check ("type" in ('sms', 'email', 'app_push', 'telegram_bot', 'system')) not null, "category" text check ("category" in ('system', 'general')) not null default 'general', "message" varchar(255) not null, "link" varchar(255) null, "metadata" jsonb not null, "status" text check ("status" in ('pending', 'sent', 'delivered', 'failed', 'canceled')) not null default 'pending', "priority" varchar(255) not null default 'normal', "is_read" boolean not null default false, "read_at" timestamptz null, "sent_at" timestamptz null, "error_message" varchar(255) null);`,
    );

    this.addSql(
      `create table "blog_post_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "slug" varchar(255) not null, "body" text not null, "excerpt" text null, "cover_image" varchar(255) null, "meta_title" varchar(255) null, "meta_description" text null, "og_image" varchar(255) null, "status" varchar(255) not null default 'draft', "redirect_url" varchar(255) null, "publish_at" timestamptz null, "type" varchar(255) null, "author_id" int not null, "published_at" timestamptz null);`,
    );
    this.addSql(
      `alter table "blog_post_entity" add constraint "blog_post_entity_slug_unique" unique ("slug");`,
    );

    this.addSql(
      `create table "blog_post_entity_categories" ("blog_post_entity_id" int not null, "blog_category_entity_id" int not null, constraint "blog_post_entity_categories_pkey" primary key ("blog_post_entity_id", "blog_category_entity_id"));`,
    );

    this.addSql(
      `alter table "roles_entity" add constraint "roles_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "notification_preference_entity" add constraint "notification_preference_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "notification_entity" add constraint "notification_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "blog_post_entity" add constraint "blog_post_entity_author_id_foreign" foreign key ("author_id") references "user_entity" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "blog_post_entity_categories" add constraint "blog_post_entity_categories_blog_post_entity_id_foreign" foreign key ("blog_post_entity_id") references "blog_post_entity" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "blog_post_entity_categories" add constraint "blog_post_entity_categories_blog_category_entity_id_foreign" foreign key ("blog_category_entity_id") references "blog_category_entity" ("id") on update cascade on delete cascade;`,
    );
  }
}
exports.Migration20260619071248 = Migration20260619071248;
