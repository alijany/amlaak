import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { JSMigrationGenerator, Migrator } from '@mikro-orm/migrations';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { defineConfig } from '@mikro-orm/postgresql';
import { PostgreSqlOptions } from '@mikro-orm/postgresql/PostgreSqlMikroORM';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MigrationService } from './orm.service.migration';
import { OptionsFunction } from './orm.types.factory';

/**
 * Factory function for creating a MikroORM nest module.
 * @param options - A function that returns options for configuring the module.
 * @returns The configuration object for the MikroORM module.
 */
export const postgresModuleFactory = (options: OptionsFunction) =>
  MikroOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    providers: [MigrationService],
    useFactory: (configService: ConfigService) => {
      // A naming strategy that prefixes table names with a specified prefix.
      class PrefixedNamingStrategy extends UnderscoreNamingStrategy {
        classToTableName(entityName?: string) {
          return prefix ? `${prefix}_${entityName}` : entityName;
        }
      }
      // Get the migrations path and prefix from the options function
      const { migrationsPath, prefix } = options(configService);
      const config: PostgreSqlOptions = {
        user: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        dbName: configService.get<string>('POSTGRES_DB'),
        port: configService.get<number>('POSTGRES_PORT', { infer: true }),
        host: configService.get<string>('DB_HOST'),
        namingStrategy: prefix ? PrefixedNamingStrategy : undefined,
        extensions: [Migrator],
        entities: [],
        migrations: {
          path: migrationsPath,
          generator: JSMigrationGenerator,
        },
      };
      // Return the MikroORM module configuration
      return {
        ...defineConfig(config),
        autoLoadEntities: true,
      };
    },
  });
