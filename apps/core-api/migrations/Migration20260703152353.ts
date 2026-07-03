'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260703152353 extends Migration {

  async up() {
    this.addSql(`alter table "crawl_schedule_entity" add column "url" text null;`);
  }

  async down() {
    this.addSql(`alter table "crawl_schedule_entity" drop column "url";`);
  }

}
exports.Migration20260703152353 = Migration20260703152353;
