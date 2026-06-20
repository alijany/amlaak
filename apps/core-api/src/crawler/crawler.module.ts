import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { BROWSER_GATEWAY, CRAWL_JOBS_QUEUE } from './crawler.constants';
import { CrawlerBootstrapService } from './crawler.bootstrap.service';
import { CamofoxBrowserGateway } from './browser/camofox.browser.gateway';
import { CrawlJobController } from './jobs/crawl-job.controller';
import { CrawlJobEntity } from './jobs/crawl-job.entity';
import { CrawlJobProcessor } from './jobs/crawl-job.processor';
import { CrawlJobService } from './jobs/crawl-job.service';
import { AdvertisementController } from './pipeline/advertisement.controller';
import { RealEstateAdvertisementEntity } from './pipeline/advertisement.entity';
import { AdvertisementService } from './pipeline/advertisement.service';
import { NormalizationService } from './pipeline/normalization.service';
import { CrawlerProviderRegistry } from './providers/crawler-provider.registry';
import { DivarAuthProvider } from './providers/divar/divar.auth.provider';
import { DivarCrawlerProvider } from './providers/divar/divar.crawler.provider';
import { MockAuthProvider } from './providers/mock/mock.auth.provider';
import { MockCrawlerProvider } from './providers/mock/mock.crawler.provider';
import { CrawlSessionEntity } from './sessions/crawl-session.entity';
import { CrawlSessionService } from './sessions/crawl-session.service';
import { CrawlTargetController } from './targets/crawl-target.controller';
import { CrawlTargetEntity } from './targets/crawl-target.entity';
import { CrawlTargetService } from './targets/crawl-target.service';

/**
 * Self-contained crawler subsystem. Decoupled from the rest of the app: it
 * depends only on shared infra (ORM base classes, Bull, the auth guards) and
 * exposes its functionality over HTTP.
 *
 * Extension points:
 *  - add a website   -> implement CrawlerProvider + register here & in the registry
 *  - swap the browser -> change the BROWSER_GATEWAY useClass
 *  - extend pipeline  -> add stages behind ExtractionPipeline
 */
@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: CRAWL_JOBS_QUEUE }),
    MikroOrmModule.forFeature([
      CrawlTargetEntity,
      CrawlSessionEntity,
      CrawlJobEntity,
      RealEstateAdvertisementEntity,
    ]),
  ],
  controllers: [
    CrawlTargetController,
    CrawlJobController,
    AdvertisementController,
  ],
  providers: [
    // services
    CrawlTargetService,
    CrawlSessionService,
    CrawlJobService,
    AdvertisementService,
    NormalizationService,
    // browser gateway (swap useClass to change backend)
    { provide: BROWSER_GATEWAY, useClass: CamofoxBrowserGateway },
    // providers + registry
    CrawlerProviderRegistry,
    MockCrawlerProvider,
    MockAuthProvider,
    DivarCrawlerProvider,
    DivarAuthProvider,
    // queue worker + startup seeding
    CrawlJobProcessor,
    CrawlerBootstrapService,
  ],
  exports: [CrawlTargetService, AdvertisementService],
})
export class CrawlerModule {}
