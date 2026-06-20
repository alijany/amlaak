import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { BROWSER_GATEWAY, CRAWL_JOBS_QUEUE } from './crawler.constants';
import { CamofoxBrowserGateway } from './browser/camofox.browser.gateway';
import { CrawlJobController } from './jobs/crawl-job.controller';
import { CrawlJobEntity } from './jobs/crawl-job.entity';
import { CrawlJobProcessor } from './jobs/crawl-job.processor';
import { CrawlJobService } from './jobs/crawl-job.service';
import { CrawlerProviderRegistry } from './providers/crawler-provider.registry';
import { CrawlScheduleController } from './scheduling/crawl-schedule.controller';
import { CrawlScheduleEntity } from './scheduling/crawl-schedule.entity';
import { CrawlScheduleService } from './scheduling/crawl-schedule.service';
import { CrawlResultSinkRegistry } from './sink/crawl-sink.registry';
import { CrawlSessionEntity } from './sessions/crawl-session.entity';
import { CrawlSessionService } from './sessions/crawl-session.service';
import { CrawlTargetController } from './targets/crawl-target.controller';
import { CrawlTargetEntity } from './targets/crawl-target.entity';
import { CrawlTargetService } from './targets/crawl-target.service';

/**
 * Generic, domain-agnostic crawling engine: targets, auth sessions, the Bull
 * job queue + worker, the browser gateway, and the provider/sink registries.
 *
 * It knows nothing about any specific site or domain entity. Domain modules
 * (e.g. {@link RealEstateModule}) import this module and register their
 * providers + sinks against the exported registries.
 *
 * Extension points:
 *  - add a website   -> implement CrawlerProvider in a domain module + register
 *  - persist a domain -> implement CrawlResultSink in a domain module + register
 *  - swap the browser -> change the BROWSER_GATEWAY useClass
 */
@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: CRAWL_JOBS_QUEUE,
      // Politeness: cap how many crawl jobs run per window across all targets.
      limiter: {
        max: Number(process.env.CRAWL_QUEUE_MAX ?? 5),
        duration: Number(process.env.CRAWL_QUEUE_DURATION_MS ?? 10_000),
      },
    }),
    MikroOrmModule.forFeature([
      CrawlTargetEntity,
      CrawlSessionEntity,
      CrawlJobEntity,
      CrawlScheduleEntity,
    ]),
  ],
  controllers: [
    CrawlTargetController,
    CrawlJobController,
    CrawlScheduleController,
  ],
  providers: [
    // services
    CrawlTargetService,
    CrawlSessionService,
    CrawlJobService,
    CrawlScheduleService,
    // browser gateway (swap useClass to change backend)
    { provide: BROWSER_GATEWAY, useClass: CamofoxBrowserGateway },
    // registries (domain modules register providers/sinks here)
    CrawlerProviderRegistry,
    CrawlResultSinkRegistry,
    // queue worker
    CrawlJobProcessor,
  ],
  exports: [
    CrawlTargetService,
    CrawlerProviderRegistry,
    CrawlResultSinkRegistry,
    BROWSER_GATEWAY,
  ],
})
export class CrawlerModule {}
