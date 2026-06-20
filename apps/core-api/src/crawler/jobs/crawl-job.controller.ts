import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { CrawlJobService } from './crawl-job.service';
import { CrawlJobFilterDto } from './dtos/crawl-job.dto';

@Controller('crawler/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CrawlJobController {
  constructor(private readonly jobService: CrawlJobService) {}

  @Get()
  list(@Query() filters: CrawlJobFilterDto) {
    return this.jobService.search(filters);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.jobService.findOne({ id }, { populate: ['target'] as never });
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.jobService.cancel(id);
  }
}
