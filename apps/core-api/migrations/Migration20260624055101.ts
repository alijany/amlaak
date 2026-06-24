'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260624055101 extends Migration {

  async up() {
    this.addSql(`alter table "agency_entity" add column "banner" varchar(255) null, add column "website" varchar(255) null, add column "city" varchar(255) null, add column "address" varchar(255) null;`);
  }

  async down() {
    this.addSql(`alter table "agency_entity" drop column "banner", drop column "website", drop column "city", drop column "address";`);
  }

}
exports.Migration20260624055101 = Migration20260624055101;
