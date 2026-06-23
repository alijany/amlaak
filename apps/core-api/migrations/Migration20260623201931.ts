'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260623201931 extends Migration {

  async up() {
    this.addSql(`create table "crawl_target_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "site_key" varchar(255) not null, "name" varchar(255) not null, "base_url" varchar(255) not null, "start_path" varchar(255) null, "status" text check ("status" in ('ready', 'running', 'error', 'not_configured')) not null default 'not_configured', "accessibility" text check ("accessibility" in ('online', 'offline', 'unknown')) not null default 'unknown', "requires_auth" boolean not null default false, "config" jsonb null, "last_error" varchar(255) null, "last_crawled_at" timestamptz null);`);
    this.addSql(`alter table "crawl_target_entity" add constraint "crawl_target_entity_site_key_unique" unique ("site_key");`);

    this.addSql(`create table "crawl_session_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int not null, "auth_status" text check ("auth_status" in ('login_required', 'otp_pending', 'logged_in', 'error')) not null default 'login_required', "phone" varchar(255) null, "challenge_ref" varchar(255) null, "session_data" jsonb null, "expires_at" timestamptz null, "last_error" varchar(255) null);`);

    this.addSql(`create table "crawl_schedule_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int not null, "enabled" boolean not null default false, "cron" varchar(255) not null, "timezone" varchar(255) not null default 'UTC', "job_type" text check ("job_type" in ('full_scan', 'incremental', 'single_ad')) not null default 'incremental', "max_items" int not null default 24, "crawl_delay_ms" int null, "max_scrolls" int null, "last_run_at" timestamptz null, "last_job_id" int null);`);
    this.addSql(`alter table "crawl_schedule_entity" add constraint "crawl_schedule_entity_target_id_unique" unique ("target_id");`);

    this.addSql(`create table "crawl_job_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int not null, "type" text check ("type" in ('full_scan', 'incremental', 'single_ad')) not null default 'full_scan', "status" text check ("status" in ('pending', 'queued', 'running', 'completed', 'failed', 'canceled')) not null default 'pending', "params" jsonb null, "stats" jsonb null, "error" text null, "started_at" timestamptz null, "finished_at" timestamptz null);`);

    this.addSql(`create table "sms_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "to" varchar(255) not null, "from" varchar(255) not null, "message" varchar(255) not null, "metadata" jsonb not null, "status" text check ("status" in ('pending', 'sent', 'delivered', 'failed')) not null default 'pending');`);

    this.addSql(`create table "user_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "first_name" varchar(255) null, "last_name" varchar(255) null, "national_id" varchar(255) null, "organization_name" varchar(255) null, "organization_registration_number" varchar(255) null, "organization_national_id" varchar(255) null, "organization_representative" varchar(255) null, "chat_id" bigint null, "phone" varchar(255) null, "profile_picture" varchar(255) null, "user_type" varchar(255) not null default 'individual');`);
    this.addSql(`alter table "user_entity" add constraint "user_entity_chat_id_unique" unique ("chat_id");`);
    this.addSql(`alter table "user_entity" add constraint "user_entity_phone_unique" unique ("phone");`);

    this.addSql(`create table "notification_preference_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" int not null, "category" text check ("category" in ('system', 'general')) not null, "enabled" boolean not null default true, "sms_enabled" boolean not null default true, "email_enabled" boolean not null default true, "app_push_enabled" boolean not null default true, "telegram_enabled" boolean not null default true);`);

    this.addSql(`create table "notification_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" int null, "recipient_phone" varchar(255) null, "recipient_chat_id" bigint null, "type" text check ("type" in ('sms', 'email', 'app_push', 'telegram_bot', 'system')) not null, "category" text check ("category" in ('system', 'general')) not null default 'general', "message" varchar(255) not null, "link" varchar(255) null, "metadata" jsonb not null, "status" text check ("status" in ('pending', 'sent', 'delivered', 'failed', 'canceled')) not null default 'pending', "priority" varchar(255) not null default 'normal', "is_read" boolean not null default false, "read_at" timestamptz null, "sent_at" timestamptz null, "error_message" varchar(255) null);`);

    this.addSql(`create table "agency_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "slug" varchar(255) null, "description" text null, "phone" varchar(255) null, "logo" varchar(255) null, "is_active" boolean not null default true, "is_platform" boolean not null default false, "owner_id" int null);`);
    this.addSql(`create index "agency_entity_name_index" on "agency_entity" ("name");`);
    this.addSql(`alter table "agency_entity" add constraint "agency_entity_slug_unique" unique ("slug");`);

    this.addSql(`create table "roles_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "role" text check ("role" in ('admin', 'owner', 'manager', 'member', 'user', 'guest')) not null default 'user', "description" varchar(255) null, "user_id" int not null, "agency_id" int null, "invitation_status" text check ("invitation_status" in ('pending', 'awaiting_profile_completion', 'accepted')) not null default 'pending');`);
    this.addSql(`create index "roles_entity_agency_id_index" on "roles_entity" ("agency_id");`);

    this.addSql(`create table "real_estate_advertisement_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "target_id" int null, "source" text check ("source" in ('crawler', 'user')) not null default 'crawler', "agency_id" int null, "created_by_id" int null, "job_id" int null, "external_id" varchar(255) null, "source_url" text null, "title" varchar(255) null, "description" text null, "category" text check ("category" in ('sale', 'rent', 'mortgage', 'unknown')) not null default 'unknown', "total_price" bigint null, "deposit" bigint null, "rent" bigint null, "price_per_meter" bigint null, "area" int null, "rooms" int null, "year_built" int null, "floor" int null, "province" varchar(255) null, "city" varchar(255) null, "district" varchar(255) null, "lat" double precision null, "lng" double precision null, "images" jsonb null, "attributes" jsonb null, "raw_payload" jsonb null, "posted_at" timestamptz null, "crawled_at" timestamptz null, "publish_status" text check ("publish_status" in ('pending', 'published', 'rejected')) not null default 'pending', "published_at" timestamptz null, "telegram_posted_at" timestamptz null, "telegram_message_id" bigint null);`);
    this.addSql(`create index "real_estate_advertisement_entity_source_index" on "real_estate_advertisement_entity" ("source");`);
    this.addSql(`create index "real_estate_advertisement_entity_agency_id_index" on "real_estate_advertisement_entity" ("agency_id");`);
    this.addSql(`create index "real_estate_advertisement_entity_title_index" on "real_estate_advertisement_entity" ("title");`);
    this.addSql(`create index "real_estate_advertisement_entity_city_index" on "real_estate_advertisement_entity" ("city");`);
    this.addSql(`create index "real_estate_advertisement_entity_publish_status_index" on "real_estate_advertisement_entity" ("publish_status");`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_target_id_external_id_unique" unique ("target_id", "external_id");`);

    this.addSql(`create table "lead_pool_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "agency_id" int null, "name" varchar(255) not null, "description" text null, "is_active" boolean not null default true);`);
    this.addSql(`create index "lead_pool_entity_agency_id_index" on "lead_pool_entity" ("agency_id");`);

    this.addSql(`create table "lead_entity" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "agency_id" int null, "advertisement_id" int not null, "assigned_agent_id" int null, "pool_id" int null, "status" text check ("status" in ('new', 'contacted', 'qualified', 'won', 'lost')) not null default 'new', "source" text check ("source" in ('phone_call', 'telegram', 'instagram', 'website', 'referral', 'other')) not null default 'other', "tracking_code" varchar(255) null, "contact_name" varchar(255) null, "contact_phone" varchar(255) null, "note" text null, "last_contacted_at" timestamptz null, "closed_at" timestamptz null);`);
    this.addSql(`create index "lead_entity_agency_id_index" on "lead_entity" ("agency_id");`);
    this.addSql(`create index "lead_entity_assigned_agent_id_index" on "lead_entity" ("assigned_agent_id");`);
    this.addSql(`create index "lead_entity_status_index" on "lead_entity" ("status");`);

    this.addSql(`alter table "crawl_session_entity" add constraint "crawl_session_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);

    this.addSql(`alter table "crawl_schedule_entity" add constraint "crawl_schedule_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);

    this.addSql(`alter table "crawl_job_entity" add constraint "crawl_job_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade;`);

    this.addSql(`alter table "notification_preference_entity" add constraint "notification_preference_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`);

    this.addSql(`alter table "notification_entity" add constraint "notification_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "agency_entity" add constraint "agency_entity_owner_id_foreign" foreign key ("owner_id") references "user_entity" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "roles_entity" add constraint "roles_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`);
    this.addSql(`alter table "roles_entity" add constraint "roles_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_target_id_foreign" foreign key ("target_id") references "crawl_target_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_created_by_id_foreign" foreign key ("created_by_id") references "user_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "real_estate_advertisement_entity" add constraint "real_estate_advertisement_entity_job_id_foreign" foreign key ("job_id") references "crawl_job_entity" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "lead_pool_entity" add constraint "lead_pool_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "lead_entity" add constraint "lead_entity_agency_id_foreign" foreign key ("agency_id") references "agency_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "lead_entity" add constraint "lead_entity_advertisement_id_foreign" foreign key ("advertisement_id") references "real_estate_advertisement_entity" ("id") on update cascade;`);
    this.addSql(`alter table "lead_entity" add constraint "lead_entity_assigned_agent_id_foreign" foreign key ("assigned_agent_id") references "user_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "lead_entity" add constraint "lead_entity_pool_id_foreign" foreign key ("pool_id") references "lead_pool_entity" ("id") on update cascade on delete set null;`);
  }

}
exports.Migration20260623201931 = Migration20260623201931;
