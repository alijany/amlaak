import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { RealEstateModule } from '../real-estate/real-estate.module';
import { LeadController } from './lead.controller';
import { LeadPoolEntity } from './lead-pool.entity';
import { LeadPoolService } from './lead-pool.service';
import { LeadEntity } from './lead.entity';
import { LeadService } from './lead.service';

/**
 * Lead domain. Captures inbound inquiries attributed to listings, assigns them
 * to agents (directly or via shared pools), and tracks them to conversion.
 * Depends on {@link RealEstateModule} (advertisement lookup) and
 * {@link NotificationModule} (LEAD_ASSIGNED notifications).
 */
@Module({
  imports: [
    MikroOrmModule.forFeature([LeadEntity, LeadPoolEntity]),
    RealEstateModule,
    NotificationModule,
  ],
  controllers: [LeadController],
  providers: [LeadService, LeadPoolService],
  exports: [LeadService],
})
export class LeadModule {}
