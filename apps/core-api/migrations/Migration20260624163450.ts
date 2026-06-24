'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260624163450 extends Migration {

  async up() {
    this.addSql(`alter table "lead_entity" drop constraint "lead_entity_assigned_agent_id_foreign";`);

    this.addSql(`drop index "lead_entity_assigned_agent_id_index";`);
    this.addSql(`alter table "lead_entity" drop column "assigned_agent_id";`);
  }

  async down() {
    this.addSql(`alter table "lead_entity" add column "assigned_agent_id" int null;`);
    this.addSql(`alter table "lead_entity" add constraint "lead_entity_assigned_agent_id_foreign" foreign key ("assigned_agent_id") references "user_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`create index "lead_entity_assigned_agent_id_index" on "lead_entity" ("assigned_agent_id");`);
  }

}
exports.Migration20260624163450 = Migration20260624163450;
