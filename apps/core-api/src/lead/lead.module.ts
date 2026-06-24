import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AgencyModule } from '../agency/agency.module';
import { RealEstateModule } from '../real-estate/real-estate.module';
import { LeadController } from './lead.controller';
import { LeadPoolAgencyEntity } from './lead-pool-agency.entity';
import { LeadPoolEntity } from './lead-pool.entity';
import { LeadPoolService } from './lead-pool.service';
import { LeadEntity } from './lead.entity';
import { LeadService } from './lead.service';

/**
 * Lead domain. Captures inbound inquiries attributed to listings, assigns each
 * to a single agency or a shared pool (claimed by the first member agency to
 * open it), and tracks them to conversion. Depends on {@link RealEstateModule}
 * for advertisement lookup.
 */
@Module({
  imports: [
    MikroOrmModule.forFeature([
      LeadEntity,
      LeadPoolEntity,
      LeadPoolAgencyEntity,
    ]),
    RealEstateModule,
    AgencyModule,
  ],
  controllers: [LeadController],
  providers: [LeadService, LeadPoolService],
  exports: [LeadService],
})
export class LeadModule {}
