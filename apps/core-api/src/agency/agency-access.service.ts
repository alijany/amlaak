import { ForbiddenException, Injectable } from '@nestjs/common';
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
  isPlatformAdmin: boolean;
}

/**
 * Derives the active agency + permissions from the authenticated user's roles
 * (which carry their agency) and the `x-agency-id` header. Requires the user's
 * roles to be loaded with their `agency` relation (see jwt.strategy populate).
 */
@Injectable()
export class AgencyAccessService {
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
    } else {
      activeAgencyId = roles[0]?.agency?.id ?? null;
    }

    const isManager =
      isPlatformAdmin ||
      roles.some(
        (r) =>
          r.agency!.id === activeAgencyId && MANAGER_ROLES.includes(r.role),
      );

    return { viewerId: user.id, activeAgencyId, isManager, isPlatformAdmin };
  }
}
