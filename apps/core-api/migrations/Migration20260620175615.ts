'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260620175615 extends Migration {

  async up() {
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "source_url" type text using ("source_url"::text);`);
  }

  async down() {
    this.addSql(`alter table "real_estate_advertisement_entity" alter column "source_url" type varchar(255) using ("source_url"::varchar(255));`);
  }

}
exports.Migration20260620175615 = Migration20260620175615;
