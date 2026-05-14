import { MikroORM } from '@mikro-orm/core';
import { MigrationRow, UmzugMigration } from '@mikro-orm/migrations';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service responsible for handling database migrations.
 */
@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(
    private orm: MikroORM,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Lifecycle hook that is called when the module is initialized.
   * It performs the necessary database migrations.
   */
  async onModuleInit() {
    // create database if it does not exist
    const generator = this.orm.getSchemaGenerator();
    // check if the database exists
    await generator.ensureDatabase({
      create: true,
    });
    // create migrations if there are any pending
    const migrator = this.orm.getMigrator();
    const executedMigrations = await migrator.getExecutedMigrations();
    const pendingMigrations = await migrator.getPendingMigrations();
    await this.createMigration(pendingMigrations, executedMigrations, migrator);
    // run pending migrations
    for (const migration of await migrator.getPendingMigrations()) {
      await migrator.up(migration.name);
    }
  }

  /**
   * Creates a new migration if there are pending migrations.
   * If there are no pending or executed migrations, it creates an initial migration.
   * This method is only executed in non-production environments.
   * @param pendingMigrations - The list of pending migrations.
   * @param executedMigrations - The list of executed migrations.
   * @param migrator - The migrator instance.
   */
  private async createMigration(
    pendingMigrations: UmzugMigration[],
    executedMigrations: MigrationRow[],
    migrator,
  ) {
    if (this.configService.get('NODE_ENV') === 'production') return;
    if (pendingMigrations.length === 0 && executedMigrations.length === 0) {
      await migrator.createInitialMigration();
    }
    await migrator.createMigration();
  }
}
