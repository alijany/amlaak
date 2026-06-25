import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CreateCityDto, GetCitiesDto, UpdateCityDto } from './dtos/city.dto';
import { CityEntity } from './city.entity';

@Injectable()
export class CityService extends BaseRepositoryService<CityEntity> {
  constructor(
    @InjectRepository(CityEntity)
    protected repository: EntityRepository<CityEntity>,
  ) {
    super(repository);
  }

  async getCities(filters: GetCitiesDto) {
    const { page = 0, limit = 100, q } = filters;
    const where: Record<string, unknown> = { isActive: true };

    if (q) {
      where.$or = [
        { nameFa: { $like: `%${q}%` } },
        { nameEn: { $like: `%${q}%` } },
      ] as any;
    }

    const [items, total] = await this.findAll(where as any, {
      orderBy: { order: 'ASC', nameFa: 'ASC' },
      limit,
      offset: page * limit,
    });

    return {
      items,
      meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
    };
  }

  async createCity(dto: CreateCityDto) {
    const existing = await this.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('شهری با این نام وجود دارد');
    return this.create({ ...dto, order: dto.order ?? 0 });
  }

  async updateCity(id: number, dto: UpdateCityDto) {
    const city = await this.findOne({ id });
    if (!city) throw new NotFoundException('شهر یافت نشد');
    return this.updateOne({ id }, dto as any);
  }

  async deleteCity(id: number) {
    const city = await this.findOne({ id });
    if (!city) throw new NotFoundException('شهر یافت نشد');
    await this.remove(city);
  }

  /** Find an active city by its slug, or null. */
  findBySlug(slug: string) {
    return this.findOne({ slug });
  }

  /**
   * Resolve a free-text city value (from a crawler, import, or a user form)
   * to a {@link CityEntity}. Matches on slug, then exact nameFa/nameEn.
   * Returns null when nothing matches — callers should treat the value as
   * "no city" rather than inventing a row.
   */
  async resolveCity(value?: string | null): Promise<CityEntity | null> {
    if (!value) return null;
    const text = value.trim();
    if (!text) return null;

    const found = await this.findOne({
      $or: [{ slug: text }, { nameFa: text }, { nameEn: text }],
    } as any);
    return found ?? null;
  }
}
