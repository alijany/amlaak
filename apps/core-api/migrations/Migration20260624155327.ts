'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260624155327 extends Migration {

  async up() {
    this.addSql(`create table "lead_pool_agency_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "pool_id" int not null, "agency_id" int not null, "added_at" timestamptz not null);`);
    this.addSql(`create index "lead_pool_agency_entity_pool_id_index" on "lead_pool_agency_entity" ("pool_id");`);
    this.addSql(`create index "lead_pool_agency_entity_agency_id_index" on "lead_pool_agency_entity" ("agency_id");`);

    this.addSql(`alter table "lead_pool_agency_entity" add constraint "lead_pool_agency_entity_pool_id_foreign" foreign key ("pool_id") references "lead_pool_entity" ("id") on update cascade;`);
    this.addSql(`alter table "lead_pool_agency_entity" add constraint "lead_pool_agency_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade;`);
  }

  async down() {
    this.addSql(`drop table if exists "lead_pool_agency_entity" cascade;`);
  }

}
exports.Migration20260624155327 = Migration20260624155327;
