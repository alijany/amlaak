'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260623050449 extends Migration {

  async up() {
    this.addSql(`create table "agency_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "slug" varchar(255) null, "description" text null, "phone" varchar(255) null, "logo" varchar(255) null, "is_active" boolean not null default true, "is_platform" boolean not null default false, "owner_id" int null);`);
    this.addSql(`create index "agency_entity_name_index" on "agency_entity" ("name");`);
    this.addSql(`alter table "agency_entity" add constraint "agency_entity_slug_unique" unique ("slug");`);

    this.addSql(`alter table "agency_entity" add constraint "agency_entity_owner_id_foreign" foreign key ("owner_id") references "user_entity" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "roles_entity" add column "agency_id" int null;`);
    this.addSql(`alter table "roles_entity" add constraint "roles_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "roles_entity_agency_id_index" on "roles_entity" ("agency_id");`);

    this.addSql(`alter table "real_estate_advertisement_entity" add column "agency_id" int null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "real_estate_advertisement_entity_agency_id_index" on "real_estate_advertisement_entity" ("agency_id");`);

    this.addSql(`alter table "lead_pool_entity" drop constraint "lead_pool_entity_name_unique";`);

    this.addSql(`alter table "lead_pool_entity" add column "agency_id" int null;`);
    this.addSql(`alter table "lead_pool_entity" add constraint "lead_pool_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "lead_pool_entity_agency_id_index" on "lead_pool_entity" ("agency_id");`);

    this.addSql(`alter table "lead_entity" add column "agency_id" int null;`);
    this.addSql(`alter table "lead_entity" add constraint "lead_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "lead_entity_agency_id_index" on "lead_entity" ("agency_id");`);
  }

  async down() {
    this.addSql(`alter table "roles_entity" drop constraint "roles_entity_agency_id_foreign";`);

    this.addSql(`alter table "real_estate_advertisement_entity" drop constraint "real_estate_advertisement_entity_agency_id_foreign";`);

    this.addSql(`alter table "lead_pool_entity" drop constraint "lead_pool_entity_agency_id_foreign";`);

    this.addSql(`alter table "lead_entity" drop constraint "lead_entity_agency_id_foreign";`);

    this.addSql(`drop table if exists "agency_entity" cascade;`);

    this.addSql(`drop index "lead_pool_entity_agency_id_index";`);
    this.addSql(`alter table "lead_pool_entity" drop column "agency_id";`);

    this.addSql(`alter table "lead_pool_entity" add constraint "lead_pool_entity_name_unique" unique ("name");`);

    this.addSql(`drop index "real_estate_advertisement_entity_agency_id_index";`);
    this.addSql(`alter table "real_estate_advertisement_entity" drop column "agency_id";`);

    this.addSql(`drop index "roles_entity_agency_id_index";`);
    this.addSql(`alter table "roles_entity" drop column "agency_id";`);

    this.addSql(`drop index "lead_entity_agency_id_index";`);
    this.addSql(`alter table "lead_entity" drop column "agency_id";`);
  }

}
exports.Migration20260623050449 = Migration20260623050449;
