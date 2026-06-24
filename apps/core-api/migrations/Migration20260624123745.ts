'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260624123745 extends Migration {

  async up() {
    this.addSql(`alter table "agency_entity" add column "is_confirmed" boolean not null default false;`);
  }

  async down() {
    this.addSql(`alter table "agency_entity" drop column "is_confirmed";`);
  }

}
exports.Migration20260624123745 = Migration20260624123745;
