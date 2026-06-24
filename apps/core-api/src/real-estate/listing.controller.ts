import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AgencyAccessService } from 'src/agency/agency-access.service';
import { CurrentAgencyId } from 'src/agency/decorators/current-agency.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { UserEntity } from 'src/user/user.entity';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementFilterDto } from './dtos/advertisement.filter.dto';
import { CreateListingDto, UpdateListingDto } from './dtos/listing.dto';

const WORKER = [Role.MEMBER, Role.MANAGER, Role.OWNER, Role.ADMIN] as const;

/**
 * Self-service (marketplace) listings owned by the caller's agency. Created
 * PENDING and published via the existing moderation flow (approve-first).
 */
@Controller('real-estate/listings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListingController {
  constructor(
    private readonly advertisements: AdvertisementService,
    private readonly access: AgencyAccessService,
  ) {}

  @Get()
  @Roles(...WORKER)
  mine(
    @Query() filters: AdvertisementFilterDto,
    @CurrentUser() user: UserEntity,
    @CurrentAgencyId() agencyId?: number,
  ) {
    return this.advertisements.myListings(
      this.access.resolve(user, agencyId),
      filters,
    );
  }

  @Get(':id')
  @Roles(...WORKER)
  one(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @CurrentAgencyId() agencyId?: number,
  ) {
    return this.advertisements.myListing(
      id,
      this.access.resolve(user, agencyId),
    );
  }

  @Post()
  @Roles(...WORKER)
  async create(
    @Body() dto: CreateListingDto,
    @CurrentUser() user: UserEntity,
    @CurrentAgencyId() agencyId?: number,
  ) {
    const ctx = this.access.resolve(user, agencyId);
    await this.access.assertAgencyConfirmed(ctx.activeAgencyId, user);
    return this.advertisements.createUserListing(dto, ctx, user);
  }

  @Patch(':id')
  @Roles(...WORKER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
    @CurrentUser() user: UserEntity,
    @CurrentAgencyId() agencyId?: number,
  ) {
    return this.advertisements.updateUserListing(
      id,
      dto,
      this.access.resolve(user, agencyId),
    );
  }

  @Delete(':id')
  @Roles(...WORKER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @CurrentAgencyId() agencyId?: number,
  ) {
    return this.advertisements.deleteUserListing(
      id,
      this.access.resolve(user, agencyId),
    );
  }
}
