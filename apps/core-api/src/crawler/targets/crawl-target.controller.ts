import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { BrowserGateway } from '../browser/browser-gateway.interface';
import { BROWSER_GATEWAY } from '../crawler.constants';
import { CrawlJobService } from '../jobs/crawl-job.service';
import { CreateCrawlJobDto } from '../jobs/dtos/crawl-job.dto';
import { CrawlerProviderRegistry } from '../providers/crawler-provider.registry';
import { CrawlSessionEntity } from '../sessions/crawl-session.entity';
import { CrawlSessionService } from '../sessions/crawl-session.service';
import { StartLoginDto, VerifyOtpDto } from '../sessions/dtos/auth.dto';
import { CrawlTargetEntity } from './crawl-target.entity';
import { CrawlTargetService } from './crawl-target.service';
import {
  CreateCrawlTargetDto,
  UpdateCrawlTargetDto,
} from './dtos/crawl-target.dto';

/** Public (sanitized) view of an auth session — never leaks sessionData. */
function toAuthView(session: CrawlSessionEntity) {
  return {
    targetId: session.target?.id,
    authStatus: session.authStatus,
    phone: session.phone,
    expiresAt: session.expiresAt,
    lastError: session.lastError,
  };
}

@Controller('crawler/targets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CrawlTargetController {
  constructor(
    private readonly targetService: CrawlTargetService,
    private readonly sessionService: CrawlSessionService,
    private readonly jobService: CrawlJobService,
    private readonly registry: CrawlerProviderRegistry,
    @Inject(BROWSER_GATEWAY) private readonly browser: BrowserGateway,
  ) {}

  /** Registered provider implementations (for "available crawlers" UI). */
  @Get('providers')
  listProviders() {
    return this.registry.list().map((p) => p.metadata);
  }

  /** Browser backend (Camoufox) availability for the dashboard. */
  @Get('browser')
  browserHealth() {
    return this.browser.health();
  }

  @Post()
  create(@Body() dto: CreateCrawlTargetDto): Promise<CrawlTargetEntity> {
    return this.targetService.create(dto);
  }

  @Get()
  async list() {
    const [items] = await this.targetService.findAll(
      {},
      { orderBy: { created_at: 'ASC' } },
    );
    return { items };
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.targetService.getByIdOrThrow(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCrawlTargetDto,
  ) {
    return this.targetService.updateOne({ id }, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.targetService.remove({ id });
    return { success: true };
  }

  // --- interactive OTP auth workflow ---

  @Get(':id/auth')
  async authStatus(@Param('id', ParseIntPipe) id: number) {
    return toAuthView(await this.sessionService.getStatus(id));
  }

  @Post(':id/auth/start')
  async authStart(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StartLoginDto,
  ) {
    return toAuthView(await this.sessionService.startLogin(id, dto.phone));
  }

  @Post(':id/auth/verify')
  async authVerify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyOtpDto,
  ) {
    return toAuthView(await this.sessionService.verifyOtp(id, dto.otp));
  }

  @Post(':id/auth/logout')
  async authLogout(@Param('id', ParseIntPipe) id: number) {
    return toAuthView(await this.sessionService.logout(id));
  }

  // --- jobs ---

  @Post(':id/jobs')
  enqueueJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCrawlJobDto,
  ) {
    return this.jobService.enqueue(id, dto);
  }
}
