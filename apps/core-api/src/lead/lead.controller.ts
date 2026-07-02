import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { LeadFilterDto } from './dtos/lead-filter.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { LeadService } from './lead.service';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @Public()
  async createLead(@Body() dto: CreateLeadDto) {
    return this.leadService.createLead(dto);
  }

  @Get('manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getLeads(@Query() filters: LeadFilterDto) {
    return this.leadService.findLeads(filters);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async updateLead(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadService.updateLead(id, dto);
  }
}
