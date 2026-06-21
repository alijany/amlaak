import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { CrawlScheduleEntity } from './crawl-schedule.entity';
import { CrawlScheduleService } from './crawl-schedule.service';
import { UpsertCrawlScheduleDto } from './dtos/crawl-schedule.dto';

@Controller('crawler/schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CrawlScheduleController {
  constructor(private readonly schedules: CrawlScheduleService) {}

  private toView(schedule: CrawlScheduleEntity) {
    return {
      targetId: schedule.target?.id,
      target: schedule.target
        ? {
            id: schedule.target.id,
            name: schedule.target.name,
            siteKey: schedule.target.siteKey,
          }
        : undefined,
      enabled: schedule.enabled,
      cron: schedule.cron,
      timezone: schedule.timezone,
      jobType: schedule.jobType,
      maxItems: schedule.maxItems,
      crawlDelayMs: schedule.crawlDelayMs,
      maxScrolls: schedule.maxScrolls,
      lastRunAt: schedule.lastRunAt,
      lastJobId: schedule.lastJobId,
      nextRunAt: this.schedules.nextRunAt(schedule),
    };
  }

  @Get()
  async list() {
    const items = await this.schedules.list();
    return { items: items.map((s) => this.toView(s)) };
  }

  @Get(':targetId')
  async get(@Param('targetId', ParseIntPipe) targetId: number) {
    const schedule = await this.schedules.getByTarget(targetId);
    if (!schedule) throw new NotFoundException('No schedule for this target.');
    return this.toView(schedule);
  }

  @Put(':targetId')
  async upsert(
    @Param('targetId', ParseIntPipe) targetId: number,
    @Body() dto: UpsertCrawlScheduleDto,
  ) {
    return this.toView(await this.schedules.upsert(targetId, dto));
  }

  @Post(':targetId/enable')
  async enable(@Param('targetId', ParseIntPipe) targetId: number) {
    return this.toView(await this.schedules.setEnabled(targetId, true));
  }

  @Post(':targetId/disable')
  async disable(@Param('targetId', ParseIntPipe) targetId: number) {
    return this.toView(await this.schedules.setEnabled(targetId, false));
  }

  @Post(':targetId/run')
  async runNow(@Param('targetId', ParseIntPipe) targetId: number) {
    const job = await this.schedules.runNow(targetId);
    return { jobId: job.id, status: job.status };
  }

  @Delete(':targetId')
  async remove(@Param('targetId', ParseIntPipe) targetId: number) {
    await this.schedules.remove(targetId);
    return { success: true };
  }
}
