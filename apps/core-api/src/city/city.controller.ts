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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/roles/roles.constants';
import { CityService } from './city.service';
import { CreateCityDto, GetCitiesDto, UpdateCityDto } from './dtos/city.dto';

@Controller('cities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @Public()
  getCities(@Query() filters: GetCitiesDto) {
    return this.cityService.getCities(filters);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCityDto) {
    return this.cityService.createCity(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCityDto) {
    return this.cityService.updateCity(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.deleteCity(id);
  }
}
