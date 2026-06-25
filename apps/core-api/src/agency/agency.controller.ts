import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { AgencyAccessService } from './agency-access.service';
import { AgencyService } from './agency.service';
import { InviteAgencyMemberDto } from './dtos/agency-member.dto';
import {
  AgencyFilterDto,
  CreateAgencyDto,
  InviteAgencyDto,
  UpdateAgencyDto,
} from './dtos/agency.dto';

const MANAGER = [Role.OWNER, Role.MANAGER, Role.ADMIN] as const;

@Controller('agencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgencyController {
  constructor(
    private readonly agencies: AgencyService,
    private readonly access: AgencyAccessService,
  ) {}

  /** Agencies the caller belongs to (drives the frontend switcher). */
  @Get('mine')
  mine(@CurrentUser() user: UserEntity) {
    return this.agencies.myAgencies(user);
  }

  /** Admin: pre-create an agency and invite a user as its pending OWNER. */
  @Post('invite')
  @Roles(Role.ADMIN)
  inviteAgency(@Body() dto: InviteAgencyDto) {
    return this.agencies.inviteAgency(dto);
  }

  /** Admin: list agencies awaiting confirmation. */
  @Get('pending')
  @Roles(Role.ADMIN)
  pending() {
    return this.agencies.listPendingAgencies();
  }

  /** Admin: paginated list of all agencies, filterable by status/search. */
  @Get()
  @Roles(Role.ADMIN)
  list(@Query() filters: AgencyFilterDto) {
    return this.agencies.listAgencies(filters);
  }

  /** Any authenticated user can register an agency (becomes its OWNER). */
  @Post()
  create(@Body() dto: CreateAgencyDto, @CurrentUser() user: UserEntity) {
    return this.agencies.createAgency(dto, user);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserEntity) {
    this.access.resolve(user, id); // throws unless member / platform admin
    return this.agencies.getAgency(id);
  }

  @Patch(':id')
  @Roles(...MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgencyDto,
    @CurrentUser() user: UserEntity,
  ) {
    const ctx = this.access.resolve(user, id);
    if (!ctx.isManager) {
      throw new ForbiddenException('agency manager access required');
    }
    // Telegram group + lead-delivery config are operator settings: only a
    // platform admin may change them. Strip them for agency owners/managers.
    if (!ctx.isPlatformAdmin) {
      delete dto.telegramGroupId;
      delete dto.leadDelivery;
    }
    return this.agencies.updateAgency(id, dto);
  }

  @Get(':id/members')
  @Roles(...MANAGER)
  members(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    this.assertManager(user, id);
    return this.agencies.listMembers(id);
  }

  @Post(':id/members')
  @Roles(...MANAGER)
  invite(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InviteAgencyMemberDto,
    @CurrentUser() user: UserEntity,
  ) {
    this.assertManager(user, id);
    return this.agencies.inviteMember(id, dto);
  }

  @Delete(':id/members/:roleId')
  @Roles(...MANAGER)
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @CurrentUser() user: UserEntity,
  ) {
    this.assertManager(user, id);
    return this.agencies.removeMember(id, roleId, user.id);
  }

  /** Admin: confirm a self-registered agency. */
  @Patch(':id/confirm')
  @Roles(Role.ADMIN)
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.agencies.confirmAgency(id);
  }

  /** Admin: reject/deactivate a self-registered agency. */
  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.agencies.rejectAgency(id);
  }

  /** Caller must own/manage this specific agency (or be a platform admin). */
  private assertManager(user: UserEntity, agencyId: number) {
    const ctx = this.access.resolve(user, agencyId);
    if (!ctx.isManager) {
      throw new ForbiddenException('agency manager access required');
    }
  }
}
