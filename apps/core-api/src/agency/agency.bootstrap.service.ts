import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LeadPoolEntity } from '../lead/lead-pool.entity';
import { LeadEntity } from '../lead/lead.entity';
import { RealEstateAdvertisementEntity } from '../real-estate/advertisement.entity';
import { Role } from '../roles/roles.constants';
import { RolesEntity } from '../roles/roles.entity';
import { UserEntity } from '../user/user.entity';
import { AgencyEntity } from './agency.entity';

/**
 * Seeds the single platform agency and backfills pre-existing data (crawled
 * listings, M1 leads/pools, and any agency-role rows) so multi-tenant scoping
 * doesn't hide legacy records. Idempotent and best-effort.
 */
@Injectable()
export class AgencyBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AgencyBootstrapService.name);

  constructor(private readonly em: EntityManager) {}

  async onApplicationBootstrap(): Promise<void> {
    const fork = this.em.fork();
    try {
      let agency = await fork.findOne(AgencyEntity, { isPlatform: true });
      if (!agency) {
        agency = fork.create(AgencyEntity, {
          name: 'پلتفرم',
          slug: 'platform',
          isPlatform: true,
          isActive: true,
        });
        await fork.persistAndFlush(agency);
        this.logger.log('Seeded platform agency');
      }

      // Owner = first platform admin, if any.
      if (!agency.owner) {
        const admin = await fork.findOne(UserEntity, {
          roles: { role: Role.ADMIN },
        });
        if (admin) {
          agency.owner = admin;
          await fork.persistAndFlush(agency);
        }
      }

      // Backfill legacy null-agency rows to the platform agency.
      await fork.nativeUpdate(
        RealEstateAdvertisementEntity,
        { agency: null },
        { agency: agency.id },
      );
      await fork.nativeUpdate(
        LeadEntity,
        { agency: null },
        { agency: agency.id },
      );
      await fork.nativeUpdate(
        LeadPoolEntity,
        { agency: null },
        { agency: agency.id },
      );
      await fork.nativeUpdate(
        RolesEntity,
        {
          agency: null,
          role: { $in: [Role.OWNER, Role.MANAGER, Role.MEMBER] },
        },
        { agency: agency.id },
      );
    } catch (err: any) {
      this.logger.warn('Agency bootstrap failed: ' + (err?.message ?? err));
    }
  }
}
