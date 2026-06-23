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
import { UpdateAgencyDto } from './dtos/agency.dto';

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
    this.assertManager(user, id);
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
    return this.agencies.removeMember(id, roleId);
  }

  /** Caller must own/manage this specific agency (or be a platform admin). */
  private assertManager(user: UserEntity, agencyId: number) {
    const ctx = this.access.resolve(user, agencyId);
    if (!ctx.isManager) {
      throw new ForbiddenException('agency manager access required');
    }
  }
}
