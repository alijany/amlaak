'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260623104920 extends Migration {

  async up() {
    this.addSql(`alter table "real_estate_advertisement_entity" drop constraint "real_estate_advertisement_entity_target_id_foreign";`);

    this.addSql(`alter table "real_estate_advertisement_entity" add column "source" text check ("source" in ('crawler', 'user')) not null default 'crawler', add column "created_by_id" int null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "target_id" type int using ("target_id"::int);`);
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "target_id" drop not null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "external_id" type varchar(255) using ("external_id"::varchar(255));`);
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "external_id" drop not null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_created_by_id_foreign" foreign key ("created_by_id") references "user_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "real_estate_advertisement_entity_source_index" on "real_estate_advertisement_entity" ("source");`);
  }

  async down() {
    this.addSql(`alter table "real_estate_advertisement_entity" drop constraint "real_estate_advertisement_entity_created_by_id_foreign";`);
    this.addSql(`alter table "real_estate_advertisement_entity" drop constraint "real_estate_advertisement_entity_target_id_foreign";`);

    this.addSql(`drop index "real_estate_advertisement_entity_source_index";`);
    this.addSql(`alter table "real_estate_advertisement_entity" drop column "source", drop column "created_by_id";`);

    this.addSql(`alter table "real_estate_advertisement_entity" alter column "target_id" type int using ("target_id"::int);`);
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "target_id" set not null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "external_id" type varchar(255) using ("external_id"::varchar(255));`);
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "external_id" set not null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);
  }

}
exports.Migration20260623104920 = Migration20260623104920;
