import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CrawlerAuthStatus } from '../crawler.constants';
import { CrawlerProviderRegistry } from '../providers/crawler-provider.registry';
import { CrawlTargetService } from '../targets/crawl-target.service';
import { CrawlSessionEntity } from './crawl-session.entity';

/**
 * Drives the interactive OTP state machine for a target:
 *   LOGIN_REQUIRED --start--> OTP_PENDING --verify--> LOGGED_IN  (errors -> ERROR)
 *
 * The actual auth work is delegated to the target provider's
 * {@link CrawlerAuthProvider}; this service only persists state transitions.
 */
@Injectable()
export class CrawlSessionService extends BaseRepositoryService<CrawlSessionEntity> {
  private readonly logger = new Logger(CrawlSessionService.name);

  constructor(
    @InjectRepository(CrawlSessionEntity)
    protected repository: EntityRepository<CrawlSessionEntity>,
    private readonly targetService: CrawlTargetService,
    private readonly registry: CrawlerProviderRegistry,
  ) {
    super(repository);
  }

  /** Get (or lazily create) the session row for a target. */
  async getOrCreate(targetId: number): Promise<CrawlSessionEntity> {
    const existing = await this.findOne(
      { target: targetId },
      { populate: ['target'] as never },
    );
    if (existing) return existing;

    const target = await this.targetService.getByIdOrThrow(targetId);
    return this.create({ target });
  }

  async getStatus(targetId: number): Promise<CrawlSessionEntity> {
    return this.getOrCreate(targetId);
  }

  async startLogin(
    targetId: number,
    phone: string,
  ): Promise<CrawlSessionEntity> {
    const session = await this.getOrCreate(targetId);
    const target = await this.targetService.getByIdOrThrow(targetId);
    const auth = this.registry.get(target.siteKey).getAuthProvider();

    try {
      const challenge = await auth.startLogin({
        sessionId: this.sessionKey(targetId),
        phone,
      });
      session.phone = phone;
      session.challengeRef = challenge.challengeRef;
      session.authStatus = CrawlerAuthStatus.OTP_PENDING;
      session.lastError = undefined;
      await this.persistAndFlush(session);
      return session;
    } catch (err: any) {
      return this.fail(session, err);
    }
  }

  async verifyOtp(targetId: number, otp: string): Promise<CrawlSessionEntity> {
    const session = await this.getOrCreate(targetId);
    if (session.authStatus !== CrawlerAuthStatus.OTP_PENDING) {
      throw new BadRequestException(
        'No login in progress. Start a login before submitting an OTP.',
      );
    }
    const target = await this.targetService.getByIdOrThrow(targetId);
    const auth = this.registry.get(target.siteKey).getAuthProvider();

    try {
      const result = await auth.submitOtp({
        sessionId: this.sessionKey(targetId),
        phone: session.phone,
        otp,
        challengeRef: session.challengeRef,
      });
      session.authStatus = result.status;
      session.sessionData = result.session ?? undefined;
      session.expiresAt = result.expiresAt ?? undefined;
      session.lastError =
        result.status === CrawlerAuthStatus.ERROR
          ? 'OTP verification failed'
          : undefined;
      await this.persistAndFlush(session);
      return session;
    } catch (err: any) {
      return this.fail(session, err);
    }
  }

  async logout(targetId: number): Promise<CrawlSessionEntity> {
    const session = await this.getOrCreate(targetId);
    const target = await this.targetService.getByIdOrThrow(targetId);
    const auth = this.registry.get(target.siteKey).getAuthProvider();

    if (session.sessionData) {
      try {
        await auth.logout(session.sessionData);
      } catch (err: any) {
        this.logger.warn(`Logout cleanup failed: ${err?.message ?? err}`);
      }
    }
    session.authStatus = CrawlerAuthStatus.LOGIN_REQUIRED;
    session.sessionData = undefined;
    session.challengeRef = undefined;
    session.expiresAt = undefined;
    await this.persistAndFlush(session);
    return session;
  }

  private async fail(
    session: CrawlSessionEntity,
    err: any,
  ): Promise<CrawlSessionEntity> {
    session.authStatus = CrawlerAuthStatus.ERROR;
    session.lastError = err?.message ?? String(err);
    await this.persistAndFlush(session);
    this.logger.warn(
      `Auth error for target ${session.target?.id}: ${session.lastError}`,
    );
    return session;
  }

  private sessionKey(targetId: number): string {
    return `target-${targetId}`;
  }
}
