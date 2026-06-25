import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CityModule } from '../city/city.module';
import { NotificationModule } from '../notification/notification.module';
import { RolesModule } from '../roles/roles.module';
import { UserModule } from '../user/user.module';
import { AgencyAccessService } from './agency-access.service';
import { AgencyBootstrapService } from './agency.bootstrap.service';
import { AgencyController } from './agency.controller';
import { AgencyEntity } from './agency.entity';
import { AgencyService } from './agency.service';

/**
 * Agency (multi-tenant organization) module. Owns the Agency entity, agency
 * membership management, and the request-scoped {@link AgencyAccessService}
 * reused by the lead and real-estate modules for tenant scoping.
 */
@Module({
  imports: [
    MikroOrmModule.forFeature([AgencyEntity]),
    RolesModule,
    UserModule,
    CityModule,
    NotificationModule,
  ],
  controllers: [AgencyController],
  providers: [AgencyService, AgencyAccessService, AgencyBootstrapService],
  exports: [AgencyService, AgencyAccessService],
})
export class AgencyModule {}
