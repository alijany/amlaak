import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { UserEntity } from 'src/user/user.entity';
import { AdvertisementService } from '../real-estate/advertisement.service';
import { AssignLeadDto } from './dtos/assign-lead.dto';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { LeadFilterDto } from './dtos/lead.filter.dto';
import { CreateLeadPoolDto, UpdateLeadPoolDto } from './dtos/lead-pool.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { LeadPoolService } from './lead-pool.service';
import { LeadService } from './lead.service';
import { advertisementTrackingCode, decodeTrackingCode } from './lead.tracking';

// RolesGuard reads @Roles from the handler method only, so every route is
// annotated explicitly. Workers (agents+) can read/log; managers+ assign & manage pools.
const WORKER = [Role.MEMBER, Role.MANAGER, Role.OWNER, Role.ADMIN] as const;
const MANAGER = [Role.MANAGER, Role.OWNER, Role.ADMIN] as const;

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadController {
  constructor(
    private readonly leads: LeadService,
    private readonly pools: LeadPoolService,
    private readonly advertisements: AdvertisementService,
  ) {}

  // --- static paths (declared before :id) -------------------------------

  @Get('stats')
  @Roles(...WORKER)
  stats(@CurrentUser() user: UserEntity) {
    return this.leads.stats(user);
  }

  /** Resolve a per-listing tracking code → its advertisement. */
  @Get('lookup')
  @Roles(...WORKER)
  async lookup(@Query('code') code: string) {
    const id = decodeTrackingCode(code ?? '');
    const ad = id
      ? await this.advertisements.findOne(
          { id },
          { populate: ['target'] as never },
        )
      : null;
    if (!ad) throw new NotFoundException('no listing for that code');
    return {
      advertisement: ad,
      trackingCode: advertisementTrackingCode(ad.id),
    };
  }

  @Get('pools')
  @Roles(...WORKER)
  listPools() {
    return this.pools.list();
  }

  @Post('pools')
  @Roles(...MANAGER)
  createPool(@Body() dto: CreateLeadPoolDto) {
    return this.pools.createPool(dto);
  }

  @Patch('pools/:id')
  @Roles(...MANAGER)
  updatePool(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadPoolDto,
  ) {
    return this.pools.updatePool(id, dto);
  }

  // --- leads ------------------------------------------------------------

  @Get()
  @Roles(...WORKER)
  search(@Query() filters: LeadFilterDto, @CurrentUser() user: UserEntity) {
    return this.leads.search(filters, user);
  }

  @Post()
  @Roles(...WORKER)
  create(@Body() dto: CreateLeadDto) {
    return this.leads.createManual(dto);
  }

  @Get(':id')
  @Roles(...WORKER)
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserEntity) {
    return this.leads.findOneScoped(id, user);
  }

  @Patch(':id')
  @Roles(...WORKER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.leads.update(id, dto, user);
  }

  @Post(':id/assign')
  @Roles(...MANAGER)
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignLeadDto) {
    return this.leads.assign(id, dto.agentId);
  }

  @Post(':id/claim')
  @Roles(...WORKER)
  claim(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.leads.claim(id, user);
  }
}
