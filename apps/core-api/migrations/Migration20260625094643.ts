'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260625094643 extends Migration {

  async up() {
    this.addSql(`alter table "agency_entity" add column "telegram_group_id" bigint null, add column "lead_delivery" text check ("lead_delivery" in ('telegram', 'sms', 'disabled')) not null default 'disabled';`);
  }

  async down() {
    this.addSql(`alter table "agency_entity" drop column "telegram_group_id", drop column "lead_delivery";`);
  }

}
exports.Migration20260625094643 = Migration20260625094643;
