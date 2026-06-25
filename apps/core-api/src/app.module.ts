import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AgencyModule } from './agency/agency.module';
import { AuthModule } from './auth/auth.module';
import { CityModule } from './city/city.module';
import { CrawlerModule } from './crawler/crawler.module';
import { LeadModule } from './lead/lead.module';
import { postgresModuleFactory } from './libs/orm/orm.provider.base';
import { NotificationModule } from './notification/notification.module';
import { RealEstateModule } from './real-estate/real-estate.module';
import { RolesModule } from './roles/roles.module';
import { S3StorageModule } from './storage/s3-storage.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per minute (global default)
      },
    ]),
    postgresModuleFactory(() => ({
      migrationsPath: './migrations',
    })),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    NotificationModule,
    AuthModule,
    RolesModule,
    AgencyModule,
    S3StorageModule,
    CrawlerModule,
    RealEstateModule,
    LeadModule,
    CityModule,
  ],
})
export class AppModule {}
