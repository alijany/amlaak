import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { ConflictException, Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { BlogCategoryEntity } from './blog-category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';

@Injectable()
export class BlogCategoryService extends BaseRepositoryService<BlogCategoryEntity> {
  constructor(
    @InjectRepository(BlogCategoryEntity)
    protected repository: EntityRepository<BlogCategoryEntity>,
  ) {
    super(repository);
  }

  async createCategory(dto: CreateCategoryDto): Promise<BlogCategoryEntity> {
    const existing = await this.findOne({ slug: dto.slug });
    if (existing) {
      throw new ConflictException('دسته‌بندی با این شناسه قبلا ایجاد شده است');
    }
    return this.create({ name: dto.name, slug: dto.slug });
  }
}
