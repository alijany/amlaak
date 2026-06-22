'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260622174757 extends Migration {

  async up() {
    this.addSql(`alter table "real_estate_advertisement_entity" add column "publish_status" text check ("publish_status" in ('pending', 'published', 'rejected')) not null default 'pending', add column "published_at" timestamptz null, add column "telegram_posted_at" timestamptz null, add column "telegram_message_id" bigint null;`);
    this.addSql(`create index "real_estate_advertisement_entity_publish_status_index" on "real_estate_advertisement_entity" ("publish_status");`);
  }

  async down() {
    this.addSql(`drop index "real_estate_advertisement_entity_publish_status_index";`);
    this.addSql(`alter table "real_estate_advertisement_entity" drop column "publish_status", drop column "published_at", drop column "telegram_posted_at", drop column "telegram_message_id";`);
  }

}
exports.Migration20260622174757 = Migration20260622174757;
