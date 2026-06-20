'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260620182734 extends Migration {

  async up() {
    this.addSql(`create table "crawl_schedule_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int not null, "enabled" boolean not null default false, "cron" varchar(255) not null, "timezone" varchar(255) not null default 'UTC', "job_type" text check ("job_type" in ('full_scan', 'incremental', 'single_ad')) not null default 'incremental', "max_items" int not null default 24, "crawl_delay_ms" int null, "last_run_at" timestamptz null, "last_job_id" int null);`);
    this.addSql(`alter table "crawl_schedule_entity" add constraint "crawl_schedule_entity_target_id_unique" unique ("target_id");`);

    this.addSql(`alter table "crawl_schedule_entity" add constraint "crawl_schedule_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);
  }

  async down() {
    this.addSql(`drop table if exists "crawl_schedule_entity" cascade;`);
  }

}
exports.Migration20260620182734 = Migration20260620182734;
