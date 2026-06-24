import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AgencyEntity } from './agency.entity';
import { Role } from 'src/roles/roles.constants';
import { RolesEntity } from 'src/roles/roles.entity';
import { UserEntity } from 'src/user/user.entity';

const MANAGER_ROLES = [Role.OWNER, Role.MANAGER];

/** Resolved tenant context for a request. */
export interface AgencyContext {
  viewerId: number;
  /** The agency the request operates in. Null = cross-tenant (platform admin). */
  activeAgencyId: number | null;
  /** Owner/manager in the active agency, or a platform admin. */
  isManager: boolean;
  /**
   * Owner/manager of the *active agency* by their actual role there — does NOT
   * include platform-admin elevation. Use this when a platform admin acting
   * inside a specific agency must be treated as that agency role (e.g. lead
   * visibility), not as a super-user.
   */
  isAgencyManager: boolean;
  isPlatformAdmin: boolean;
}

/**
 * Derives the active agency + permissions from the authenticated user's roles
 * (which carry their agency) and the `x-agency-id` header. Requires the user's
 * roles to be loaded with their `agency` relation (see jwt.strategy populate).
 */
@Injectable()
export class AgencyAccessService {
  constructor(
    @InjectRepository(AgencyEntity)
    private readonly agencyRepo: EntityRepository<AgencyEntity>,
  ) {}
  isPlatformAdmin(user: UserEntity): boolean {
    return user.roles
      .getItems()
      .some((r) => r.role === Role.ADMIN && !r.agency);
  }

  private agencyRoles(user: UserEntity): RolesEntity[] {
    return user.roles.getItems().filter((r) => !!r.agency);
  }

  resolve(user: UserEntity, headerAgencyId?: number): AgencyContext {
    const isPlatformAdmin = this.isPlatformAdmin(user);
    const roles = this.agencyRoles(user);

    let activeAgencyId: number | null;
    if (headerAgencyId != null) {
      const member = roles.some((r) => r.agency!.id === headerAgencyId);
      if (!member && !isPlatformAdmin) {
        throw new ForbiddenException('not a member of this agency');
      }
      activeAgencyId = headerAgencyId;
    } else if (isPlatformAdmin) {
      // Platform admin acting in their global role → cross-tenant (see all).
      activeAgencyId = null;
    } else {
      activeAgencyId = roles[0]?.agency?.id ?? null;
    }

    const isAgencyManager =
      activeAgencyId != null &&
      roles.some(
        (r) =>
          r.agency!.id === activeAgencyId && MANAGER_ROLES.includes(r.role),
      );

    const isManager = isPlatformAdmin || isAgencyManager;

    return {
      viewerId: user.id,
      activeAgencyId,
      isManager,
      isAgencyManager,
      isPlatformAdmin,
    };
  }

  async assertAgencyConfirmed(
    agencyId: number | null,
    user: UserEntity,
  ): Promise<void> {
    if (agencyId == null) return;
    if (this.isPlatformAdmin(user)) return;
    const agency = await this.agencyRepo.findOne({ id: agencyId });
    if (!agency?.isConfirmed) {
      throw new ForbiddenException('آژانس هنوز توسط مدیر تأیید نشده است');
    }
  }
}
