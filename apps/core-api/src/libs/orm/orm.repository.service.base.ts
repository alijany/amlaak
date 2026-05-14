import {
  EntityData,
  EntityManager,
  EntityRepository,
  FilterQuery,
  FindOneOptions,
  FindOptions,
  FromEntityType,
  Loaded,
  Primary,
  Reference,
  RequiredEntityData,
} from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseRepositoryService<T extends object> {
  constructor(protected readonly repository: EntityRepository<T>) {}

  protected get em(): EntityManager {
    return this.repository.getEntityManager();
  }

  findOne(where?: FilterQuery<T>, options?: FindOneOptions<T>) {
    return this.repository.findOne(where, options);
  }

  findAll(where?: FilterQuery<T>, options?: FindOptions<T>) {
    return this.repository.findAndCount(where, options);
  }

  count(where?: FilterQuery<T>, options?: FindOptions<T>) {
    return this.repository.count(where, options);
  }

  async create(data: RequiredEntityData<T>, save = true): Promise<T> {
    const entity = this.repository.create(data);

    if (save) {
      await this.em.persistAndFlush(entity);
    }

    return entity;
  }

  async createBulk(dataArray: RequiredEntityData<T>[]): Promise<T[]> {
    const entities = dataArray.map((data) => this.repository.create(data));
    await this.em.persistAndFlush(entities);
    return entities;
  }

  async updateOne(
    where: FilterQuery<T>,
    entityData: EntityData<FromEntityType<Loaded<T, never, '*', never>>>,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    const entity = await this.findOne(where, options);

    if (!entity) {
      throw new Error(`Entity not found with filter: ${JSON.stringify(where)}`);
    }

    this.em.assign(entity, entityData);
    await this.em.persistAndFlush(entity);

    return entity;
  }

  async remove(whereOrEntity: FilterQuery<T> | T): Promise<void> {
    try {
      await this.em.removeAndFlush(whereOrEntity as T);
      return;
    } catch {
      // fallback to query removal
    }

    const entity = await this.findOne(whereOrEntity);

    if (!entity) {
      throw new Error(
        `Entity not found with filter: ${JSON.stringify(whereOrEntity)}`,
      );
    }

    await this.em.removeAndFlush(entity);
  }

  getReference(id: Primary<T>): T {
    return this.repository.getReference(id);
  }

  getReferences(ids: Primary<T>[]): T[] {
    return ids.map((id) => this.repository.getReference(id));
  }

  async persistAndFlush(
    entity: T | Reference<T> | Iterable<T | Reference<T>>,
  ): Promise<void> {
    await this.em.persistAndFlush(entity);
  }

  async withTransaction<R>(
    callback: (em: EntityManager) => Promise<R>,
  ): Promise<R> {
    return this.em.transactional(async (transactionalEm) =>
      callback(transactionalEm),
    );
  }
}
