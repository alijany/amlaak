'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260619132534 extends Migration {

  async up() {
    this.addSql(`create table "crawl_target_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "site_key" varchar(255) not null, "name" varchar(255) not null, "base_url" varchar(255) not null, "start_path" varchar(255) null, "status" text check ("status" in ('ready', 'running', 'error', 'not_configured')) not null default 'not_configured', "accessibility" text check ("accessibility" in ('online', 'offline', 'unknown')) not null default 'unknown', "requires_auth" boolean not null default false, "config" jsonb null, "last_error" varchar(255) null, "last_crawled_at" timestamptz null);`);
    this.addSql(`alter table "crawl_target_entity" add constraint "crawl_target_entity_site_key_unique" unique ("site_key");`);

    this.addSql(`create table "crawl_session_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int not null, "auth_status" text check ("auth_status" in ('login_required', 'otp_pending', 'logged_in', 'error')) not null default 'login_required', "phone" varchar(255) null, "challenge_ref" varchar(255) null, "session_data" jsonb null, "expires_at" timestamptz null, "last_error" varchar(255) null);`);

    this.addSql(`create table "crawl_job_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int not null, "type" text check ("type" in ('full_scan', 'incremental', 'single_ad')) not null default 'full_scan', "status" text check ("status" in ('pending', 'queued', 'running', 'completed', 'failed', 'canceled')) not null default 'pending', "params" jsonb null, "stats" jsonb null, "error" text null, "started_at" timestamptz null, "finished_at" timestamptz null);`);

    this.addSql(`create table "real_estate_advertisement_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int not null, "job_id" int null, "external_id" varchar(255) not null, "source_url" varchar(255) null, "title" varchar(255) null, "description" text null, "category" text check ("category" in ('sale', 'rent', 'mortgage', 'unknown')) not null default 'unknown', "total_price" bigint null, "deposit" bigint null, "rent" bigint null, "price_per_meter" bigint null, "area" int null, "rooms" int null, "year_built" int null, "floor" int null, "province" varchar(255) null, "city" varchar(255) null, "district" varchar(255) null, "lat" double precision null, "lng" double precision null, "images" jsonb null, "attributes" jsonb null, "raw_payload" jsonb null, "posted_at" timestamptz null, "crawled_at" timestamptz null);`);
    this.addSql(`create index "real_estate_advertisement_entity_title_index" on "real_estate_advertisement_entity" ("title");`);
    this.addSql(`create index "real_estate_advertisement_entity_city_index" on "real_estate_advertisement_entity" ("city");`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_target_id_external_id_unique" unique ("target_id", "external_id");`);

    this.addSql(`alter table "crawl_session_entity" add constraint "crawl_session_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);

    this.addSql(`alter table "crawl_job_entity" add constraint "crawl_job_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);

    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_job_id_foreign" foreign key ("job_id") references "crawl_job_entity" ("id") on update cascade on delete set null;`);
  }

  async down() {
    this.addSql(`alter table "crawl_session_entity" drop constraint "crawl_session_entity_target_id_foreign";`);

    this.addSql(`alter table "crawl_job_entity" drop constraint "crawl_job_entity_target_id_foreign";`);

    this.addSql(`alter table "real_estate_advertisement_entity" drop constraint "real_estate_advertisement_entity_target_id_foreign";`);

    this.addSql(`alter table "real_estate_advertisement_entity" drop constraint "real_estate_advertisement_entity_job_id_foreign";`);

    this.addSql(`drop table if exists "crawl_target_entity" cascade;`);

    this.addSql(`drop table if exists "crawl_session_entity" cascade;`);

    this.addSql(`drop table if exists "crawl_job_entity" cascade;`);

    this.addSql(`drop table if exists "real_estate_advertisement_entity" cascade;`);
  }

}
exports.Migration20260619132534 = Migration20260619132534;
