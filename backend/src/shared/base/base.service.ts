import { NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';

/**
 * Base service with common CRUD operations
 * Eliminates repetitive boilerplate across services
 */
export abstract class BaseService<T extends { id?: number | string }> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(id: number | string, relations?: string[]): Promise<T> {
    const where = { id } as FindOptionsWhere<T>;
    const entity = await this.repository.findOne({
      where,
      relations
    });

    if (!entity) {
      throw new NotFoundException(`${this.getEntityName()} with ID ${id} not found`);
    }

    return entity;
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    const saved = await this.repository.save(entity as any);
    return saved as T;
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    const entity = await this.findOne(id);
    const updated = { ...entity, ...data };
    return this.repository.save(updated as any);
  }

  async delete(id: number | string): Promise<void> {
    const result = await this.repository.delete({ id } as any);

    if (result.affected === 0) {
      throw new NotFoundException(`${this.getEntityName()} with ID ${id} not found`);
    }
  }

  protected getEntityName(): string {
    return this.repository.metadata.targetName;
  }
}
