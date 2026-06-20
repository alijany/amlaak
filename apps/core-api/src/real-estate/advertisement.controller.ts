import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementFilterDto } from './dtos/advertisement.filter.dto';

@Controller('real-estate/advertisements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdvertisementController {
  constructor(private readonly advertisements: AdvertisementService) {}

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
}
