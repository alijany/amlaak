import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementFilterDto } from './dtos/advertisement.filter.dto';
import { UpdateListingDto } from './dtos/listing.dto';
import { ListingModerationService } from './listing-moderation.service';

// RolesGuard reads @Roles from the handler method, so the moderation mutations
// are annotated explicitly (managers and above).
const MANAGER = [Role.ADMIN, Role.MANAGER, Role.OWNER] as const;

@Controller('real-estate/advertisements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdvertisementController {
  constructor(
    private readonly advertisements: AdvertisementService,
    private readonly moderation: ListingModerationService,
  ) {}

  @Get()
  search(@Query() filters: AdvertisementFilterDto) {
    return this.advertisements.search(filters);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.advertisements.findOne(
      { id },
      { populate: ['target'] as never },
    );
  }

  /** Admin-only: update any field on a crawled or user-created advertisement. */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.advertisements.adminUpdate(id, dto);
  }

  /** Approve → publish to the public site + post to Telegram. */
  @Patch(':id/publish')
  @Roles(...MANAGER)
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.moderation.approve(id);
  }

  /** Reject → hide from the public site. */
  @Patch(':id/reject')
  @Roles(...MANAGER)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.moderation.reject(id);
  }
}
