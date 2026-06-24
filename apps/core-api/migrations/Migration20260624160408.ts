'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260624160408 extends Migration {

  async up() {
    this.addSql(`alter table "lead_pool_entity" drop constraint "lead_pool_entity_agency_id_foreign";`);

    this.addSql(`drop index "lead_pool_entity_agency_id_index";`);
    this.addSql(`alter table "lead_pool_entity" drop column "agency_id";`);

    this.addSql(`alter table "lead_pool_agency_entity" add constraint "lead_pool_agency_entity_pool_id_agency_id_unique" unique ("pool_id", "agency_id");`);
  }

  async down() {
    this.addSql(`alter table "lead_pool_entity" add column "agency_id" int null;`);
    this.addSql(`alter table "lead_pool_entity" add constraint "lead_pool_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "lead_pool_entity_agency_id_index" on "lead_pool_entity" ("agency_id");`);

    this.addSql(`alter table "lead_pool_agency_entity" drop constraint "lead_pool_agency_entity_pool_id_agency_id_unique";`);
  }

}
exports.Migration20260624160408 = Migration20260624160408;
