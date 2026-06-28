import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  CrawlTargetStatus,
  TargetAccessibility,
} from '../crawler/crawler.constants';
import { CrawlTargetEntity } from '../crawler/targets/crawl-target.entity';
import {
  DIVAR_BASE_URL,
  DIVAR_GILAN_REAL_ESTATE_PATH,
} from './providers/divar/divar.constants';
import { SiteKey } from './real-estate.constants';

/**
 * Seeds the default crawl targets on startup so the dashboard is populated out
 * of the box: a fully-working Mock target and the Divar scaffold target.
 * Idempotent — only inserts targets whose siteKey doesn't already exist.
 */
@Injectable()
export class RealEstateBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RealEstateBootstrapService.name);

  constructor(private readonly em: EntityManager) {}

  async onApplicationBootstrap(): Promise<void> {
    const fork = this.em.fork();

    const isProduction = process.env.NODE_ENV === 'production';

    const defaults: Partial<CrawlTargetEntity>[] = [
      ...(!isProduction
        ? [
            {
              siteKey: SiteKey.MOCK,
              name: 'Mock (reference crawler)',
              baseUrl: 'https://example.com',
              startPath: '/mock/real-estate',
              status: CrawlTargetStatus.READY,
              accessibility: TargetAccessibility.ONLINE,
              requiresAuth: false,
            },
          ]
        : []),
      {
        siteKey: SiteKey.DIVAR,
        name: 'Divar (real-estate)',
        baseUrl: DIVAR_BASE_URL,
        startPath: DIVAR_GILAN_REAL_ESTATE_PATH,
        status: CrawlTargetStatus.NOT_CONFIGURED,
        accessibility: TargetAccessibility.UNKNOWN,
        requiresAuth: true,
      },
    ];

    try {
      for (const def of defaults) {
        const exists = await fork.findOne(CrawlTargetEntity, {
          siteKey: def.siteKey,
        });
        if (exists) continue;
        const target = fork.create(CrawlTargetEntity, def as CrawlTargetEntity);
        await fork.persistAndFlush(target);
        this.logger.log(`Seeded crawl target: ${def.siteKey}`);
      }
    } catch (err: any) {
      this.logger.warn('Crawler bootstrap failed: ' + (err?.message ?? err));
    }
  }
}
