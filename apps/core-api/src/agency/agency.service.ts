import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { CityEntity } from 'src/city/city.entity';
import { CityService } from 'src/city/city.service';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { Role } from 'src/roles/roles.constants';
import { InvitationStatus } from 'src/roles/roles.entity';
import { RolesService } from 'src/roles/roles.service';
import { UserEntity } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AgencyEntity } from './agency.entity';
import { InviteAgencyMemberDto } from './dtos/agency-member.dto';
import {
  AgencyFilterDto,
  CreateAgencyDto,
  InviteAgencyDto,
  UpdateAgencyDto,
} from './dtos/agency.dto';

@Injectable()
export class AgencyService extends BaseRepositoryService<AgencyEntity> {
  private defaultAgencyId?: number;

  constructor(
    @InjectRepository(AgencyEntity)
    protected repository: EntityRepository<AgencyEntity>,
    private readonly roles: RolesService,
    private readonly users: UserService,
    private readonly cities: CityService,
  ) {
    super(repository);
  }

  /**
   * Translate a DTO's `cityId` into the `city` relation MikroORM expects.
   * `cityId: null` clears the relation; omitted leaves it untouched.
   */
  private withCity<T extends { cityId?: number | null }>(dto: T) {
    const { cityId, ...rest } = dto;
    if (cityId === undefined) return rest;
    return {
      ...rest,
      city: cityId === null ? null : this.em.getReference(CityEntity, cityId),
    };
  }

  /** The single operator-owned (platform) agency that owns crawled/legacy data. */
  async getDefaultAgency(): Promise<AgencyEntity | null> {
    return this.findOne({ isPlatform: true });
  }

  async getDefaultAgencyId(): Promise<number | null> {
    if (this.defaultAgencyId) return this.defaultAgencyId;
    const agency = await this.getDefaultAgency();
    this.defaultAgencyId = agency?.id;
    return agency?.id ?? null;
  }

  /** Agencies the user belongs to (via their agency-scoped roles). */
  async myAgencies(user: UserEntity) {
    const ids = Array.from(
      new Set(
        user.roles
          .getItems()
          .map((r) => r.agency?.id)
          .filter((id): id is number => id != null),
      ),
    );
    if (!ids.length) return { items: [] as AgencyEntity[] };
    const [items] = await this.findAll({ id: { $in: ids } });
    return { items };
  }

  async createAgency(dto: CreateAgencyDto, owner: UserEntity) {
    const agency = await this.create({
      ...this.withCity(dto),
      owner,
      isConfirmed: false,
    });
    if (!agency.slug) {
      agency.slug = `agency-${agency.id}`;
      await this.persistAndFlush(agency);
    }
    // Upgrade an existing platform USER role to OWNER rather than adding a duplicate.
    const existingUserRole = await this.roles.findOne({
      user: owner,
      role: Role.USER,
      agency: null,
    });
    if (existingUserRole) {
      existingUserRole.role = Role.OWNER;
      existingUserRole.agency = agency;
      existingUserRole.invitationStatus = InvitationStatus.ACCEPTED;
      await this.roles.persistAndFlush(existingUserRole);
    } else {
      await this.roles.create({
        user: owner,
        role: Role.OWNER,
        agency,
        invitationStatus: InvitationStatus.ACCEPTED,
      });
    }
    return agency;
  }

  /** Admin-only: pre-create an agency and invite a user as its pending OWNER. */
  async inviteAgency(dto: InviteAgencyDto) {
    const validatedPhone = parsePhoneNumberFromString(dto.phone, 'IR');
    let user = await this.users.findOne({ phone: validatedPhone?.number });
    if (!user) {
      user = await this.users.create({
        phone: validatedPhone.number,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
    }
    const agency = await this.create({
      name: dto.agencyName,
      phone: dto.agencyPhone,
      owner: user,
      isConfirmed: true,
    });
    if (!agency.slug) {
      agency.slug = `agency-${agency.id}`;
      await this.persistAndFlush(agency);
    }
    await this.roles.create({
      user,
      role: Role.OWNER,
      agency,
      invitationStatus: InvitationStatus.PENDING,
    });
    return agency;
  }

  /** Admin: paginated list of all agencies, optionally filtered by status/search. */
  async listAgencies(filters: AgencyFilterDto) {
    const { page = 0, limit = 10, status, search } = filters;

    const where: Record<string, unknown> = {};
    if (status === 'pending') {
      where.isConfirmed = false;
      where.isActive = true;
    } else if (status === 'active') {
      where.isConfirmed = true;
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    if (search) {
      where.name = { $ilike: `%${search}%` };
    }

    const [items, total] = await this.findAll(where as never, {
      populate: ['owner', 'city'] as never,
      orderBy: { created_at: 'DESC' },
      limit,
      offset: page * limit,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async listPendingAgencies() {
    const [items] = await this.findAll(
      { isConfirmed: false, isActive: true },
      { populate: ['owner'] as never },
    );
    return { items };
  }

  async confirmAgency(id: number) {
    return this.updateOne({ id }, { isConfirmed: true });
  }

  async rejectAgency(id: number) {
    return this.updateOne({ id }, { isActive: false });
  }

  /** Public lookup by slug (active agencies only). */
  async findBySlug(slug: string) {
    return this.findOne(
      { slug, isActive: true },
      { populate: ['city'] as never },
    );
  }

  async updateAgency(id: number, dto: UpdateAgencyDto) {
    return this.updateOne({ id }, this.withCity(dto));
  }

  async listMembers(agencyId: number) {
    const [items] = await this.roles.findAll(
      { agency: agencyId },
      { populate: ['user'] as never, orderBy: { created_at: 'DESC' } },
    );
    return { items };
  }

  /** Invite/assign a user into the agency with an agency-scoped role. */
  async inviteMember(agencyId: number, dto: InviteAgencyMemberDto) {
    return this.users.inviteUserByRole({ ...dto, agencyId });
  }

  async removeMember(agencyId: number, roleId: number, callerId: number) {
    const role = await this.roles.findOne(
      { id: roleId, agency: agencyId },
      { populate: ['user'] as never },
    );
    if (!role) throw new NotFoundException('member not found');
    if (role.role === Role.OWNER)
      throw new ForbiddenException('مالک آژانس را نمی‌توان حذف کرد');
    if (role.user.id === callerId)
      throw new ForbiddenException('نمی‌توانید خودتان را از آژانس حذف کنید');
    await this.roles.remove(role);
    return { success: true };
  }

  /** Reads a single agency the viewer may access (membership checked by caller). */
  async getAgency(id: number): Promise<AgencyEntity> {
    const agency = await this.findOne(
      { id },
      { populate: ['owner', 'city'] as never },
    );
    if (!agency) throw new NotFoundException('agency not found');
    return agency;
  }
}
