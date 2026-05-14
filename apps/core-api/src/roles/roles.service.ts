import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { RolesEntity } from './roles.entity';

@Injectable()
export class RolesService extends BaseRepositoryService<RolesEntity> {
  constructor(
    @InjectRepository(RolesEntity)
    protected repository: EntityRepository<RolesEntity>,
  ) {
    super(repository);
  }
}
