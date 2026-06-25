'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260625044507 extends Migration {

  async up() {
    this.addSql(`create table "city_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name_fa" varchar(255) not null, "name_en" varchar(255) null, "slug" varchar(255) not null, "order" int not null default 0, "is_active" boolean not null default true);`);
    this.addSql(`alter table "city_entity" add constraint "city_entity_slug_unique" unique ("slug");`);

    this.addSql(`alter table "agency_entity" drop column "city";`);

    this.addSql(`alter table "agency_entity" add column "city_id" int null;`);
    this.addSql(`alter table "agency_entity" add constraint "agency_entity_city_id_foreign" foreign key ("city_id") references "city_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "agency_entity_city_id_index" on "agency_entity" ("city_id");`);

    this.addSql(`drop index "real_estate_advertisement_entity_city_index";`);
    this.addSql(`alter table "real_estate_advertisement_entity" drop column "city";`);

    this.addSql(`alter table "real_estate_advertisement_entity" add column "city_id" int null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_city_id_foreign" foreign key ("city_id") references "city_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "real_estate_advertisement_entity_city_id_index" on "real_estate_advertisement_entity" ("city_id");`);
  }

  async down() {
    this.addSql(`alter table "agency_entity" drop constraint "agency_entity_city_id_foreign";`);

    this.addSql(`alter table "real_estate_advertisement_entity" drop constraint "real_estate_advertisement_entity_city_id_foreign";`);

    this.addSql(`drop table if exists "city_entity" cascade;`);

    this.addSql(`drop index "agency_entity_city_id_index";`);
    this.addSql(`alter table "agency_entity" drop column "city_id";`);

    this.addSql(`alter table "agency_entity" add column "city" varchar(255) null;`);

    this.addSql(`drop index "real_estate_advertisement_entity_city_id_index";`);
    this.addSql(`alter table "real_estate_advertisement_entity" drop column "city_id";`);

    this.addSql(`alter table "real_estate_advertisement_entity" add column "city" varchar(255) null;`);
    this.addSql(`create index "real_estate_advertisement_entity_city_index" on "real_estate_advertisement_entity" ("city");`);
  }

}
exports.Migration20260625044507 = Migration20260625044507;
