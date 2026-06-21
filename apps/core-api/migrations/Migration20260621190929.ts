'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260621190929 extends Migration {

  async up() {
    this.addSql(`alter table "crawl_schedule_entity" add column "max_scrolls" int null;`);
  }

  async down() {
    this.addSql(`alter table "crawl_schedule_entity" drop column "max_scrolls";`);
  }

}
exports.Migration20260621190929 = Migration20260621190929;
