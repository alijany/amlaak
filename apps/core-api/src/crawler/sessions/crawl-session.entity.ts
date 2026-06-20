import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { CrawlerAuthStatus } from '../crawler.constants';
import { CrawlTargetEntity } from '../targets/crawl-target.entity';

/**
 * Authentication session for a target. One active session per target in this
 * phase. Holds the interactive-OTP state and the opaque, provider-defined
 * session payload.
 */
@Entity()
export class CrawlSessionEntity extends BaseEntity {
  @ManyToOne(() => CrawlTargetEntity)
  target: CrawlTargetEntity;

  @Enum({
    items: () => CrawlerAuthStatus,
    default: CrawlerAuthStatus.LOGIN_REQUIRED,
  })
  authStatus: CrawlerAuthStatus = CrawlerAuthStatus.LOGIN_REQUIRED;

  /** Phone used for the current login attempt. */
  @Property({ nullable: true })
  phone?: string;

  /** Correlates startLogin -> submitOtp (e.g. sidecar tab id). */
  @Property({ nullable: true })
  challengeRef?: string;

  /** Opaque provider session material (cookies/tokens). Null until logged in. */
  @Property({ type: 'json', nullable: true })
  sessionData?: Record<string, any>;

  @Property({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Property({ nullable: true })
  lastError?: string;
}
