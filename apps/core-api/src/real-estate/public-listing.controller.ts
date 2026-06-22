import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { PublicListingFilterDto } from './dtos/public-listing.filter.dto';

/**
 * Public, unauthenticated catalog of PUBLISHED listings. No guards — readable by
 * anyone. Returns the trimmed public shape (no source URL / contact / raw payload).
 */
@Controller('public/listings')
export class PublicListingController {
  constructor(private readonly advertisements: AdvertisementService) {}

  @Get()
  search(@Query() filters: PublicListingFilterDto) {
    return this.advertisements.searchPublic(filters);
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const listing = await this.advertisements.findOnePublic(id);
    if (!listing) throw new NotFoundException('listing not found');
    return listing;
  }
}
