'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260705120000 extends Migration {

  async up() {
    this.addSql(`alter table "notification_entity" add column "topic_id" bigint null;`);
  }

  async down() {
    this.addSql(`alter table "notification_entity" drop column "topic_id";`);
  }

}
exports.Migration20260705120000 = Migration20260705120000;
