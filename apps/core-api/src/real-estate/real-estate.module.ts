import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AgencyModule } from '../agency/agency.module';
import { CrawlerModule } from '../crawler/crawler.module';
import { S3StorageModule } from '../storage/s3-storage.module';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementImageService } from './advertisement-image.service';
import { RealEstateAdvertisementEntity } from './advertisement.entity';
import { AdvertisementService } from './advertisement.service';
import { ListingModerationService } from './listing-moderation.service';
import { NormalizationService } from './normalization.service';
import { PublicListingController } from './public-listing.controller';
import { TelegramListingPublisher } from './publishing/telegram-listing.publisher';
import { DivarAuthProvider } from './providers/divar/divar.auth.provider';
import { DivarCrawlerProvider } from './providers/divar/divar.crawler.provider';
import { MockAuthProvider } from './providers/mock/mock.auth.provider';
import { MockCrawlerProvider } from './providers/mock/mock.crawler.provider';
import { RealEstateBootstrapService } from './real-estate.bootstrap.service';
import { RealEstateRegistration } from './real-estate.registration';
import { RealEstateSink } from './real-estate.sink';

/**
 * Real-estate domain module. Owns the advertisement entity/store/API and the
 * site providers (Mock, Divar). It depends on the generic {@link CrawlerModule}
 * and registers its providers + advertisement sink with the engine at startup
 * (see {@link RealEstateRegistration}).
 */
@Module({
  imports: [
    CrawlerModule,
    S3StorageModule,
    AgencyModule,
    MikroOrmModule.forFeature([RealEstateAdvertisementEntity]),
  ],
  controllers: [AdvertisementController, PublicListingController],
  providers: [
    AdvertisementService,
    AdvertisementImageService,
    NormalizationService,
    ListingModerationService,
    TelegramListingPublisher,
    RealEstateSink,
    // site providers
    MockCrawlerProvider,
    MockAuthProvider,
    DivarCrawlerProvider,
    DivarAuthProvider,
    // engine wiring + target seeding
    RealEstateRegistration,
    RealEstateBootstrapService,
  ],
  exports: [AdvertisementService],
})
export class RealEstateModule {}
