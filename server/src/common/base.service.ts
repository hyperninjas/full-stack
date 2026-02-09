import { BaseRepository } from './base.repository';
import { BaseOffsetQueryDto, BaseCursorQueryDto } from './dto/query.dto';

export interface IPaginatedRepository<
  TModel,
  TQueryOffsetDto,
  TQueryCursorDto,
> {
  listWithOffsetPagination(params: TQueryOffsetDto): Promise<{
    data: TModel[];
    pagination: { total: number; page: number; limit: number };
  }>;
  listWithCursorPagination(
    params: TQueryCursorDto,
  ): Promise<{ data: TModel[]; nextCursor: string | null }>;
}

export abstract class BaseService<
  TModel extends { id: TKey },
  TCreateDto,
  TUpdateDto,
  TQueryOffsetDto extends BaseOffsetQueryDto,
  TQueryCursorDto extends BaseCursorQueryDto,
  TWhereUniqueInput,
  TRepository extends BaseRepository<
    any,
    TModel,
    any,
    any,
    any,
    any,
    TWhereUniqueInput,
    TKey
  > &
    IPaginatedRepository<TModel, TQueryOffsetDto, TQueryCursorDto>,
  TKey extends string | number = string,
> {
  constructor(protected readonly repository: TRepository) {}

  async create(data: TCreateDto): Promise<TModel> {
    return this.repository.create(data as any);
  }

  async listWithOffsetPagination(params: TQueryOffsetDto): Promise<{
    data: TModel[];
    pagination: { total: number; page: number; limit: number };
  }> {
    return this.repository.listWithOffsetPagination(params);
  }

  async listWithCursorPagination(
    params: TQueryCursorDto,
  ): Promise<{ data: TModel[]; nextCursor: string | null }> {
    return this.repository.listWithCursorPagination(params);
  }

  async findById(id: TKey): Promise<TModel | null> {
    return this.repository.findById(id);
  }

  async update(id: TKey, data: TUpdateDto): Promise<TModel> {
    return this.repository.update(id, data as any);
  }

  async delete(id: TKey): Promise<void> {
    return this.repository.delete(id);
  }
}
