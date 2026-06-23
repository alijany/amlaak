import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AgencyService } from 'src/agency/agency.service';
import { AdvertisementService } from './advertisement.service';

/**
 * Public agency storefront: an agency's profile + its published listings.
 * Unauthenticated, no guards.
 */
@Controller('public/agencies')
export class PublicAgencyController {
  constructor(
    private readonly agencies: AgencyService,
    private readonly advertisements: AdvertisementService,
  ) {}

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    const agency = await this.agencies.findBySlug(slug);
    if (!agency) throw new NotFoundException('agency not found');

    const listings = await this.advertisements.searchPublic({
      agencyId: agency.id,
      limit: 24,
    });

    return {
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        description: agency.description,
        phone: agency.phone,
        logo: agency.logo,
      },
      listings,
    };
  }
}
