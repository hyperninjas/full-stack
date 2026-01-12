/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { PrismaService } from '../prisma/prisma.service';
import {
  clampLimit,
  buildOrderBy,
  SortInput,
  applySearch,
} from './prisma-query.util';

/**
 * BaseRepository with explicit generics for maximum type safety and control.
 *
 * @template TDelegate - The Prisma Delegate (e.g. Prisma.UserDelegate)
 * @template TModel - The Model type (e.g. User)
 * @template TCreateInput - The Create Input type (e.g. Prisma.UserCreateInput)
 * @template TUpdateInput - The Update Input type (e.g. Prisma.UserUpdateInput)
 * @template TWhereInput - The Where Input type (e.g. Prisma.UserWhereInput)
 * @template TOrderByInput - The OrderBy Input type (e.g. Prisma.UserOrderByWithRelationInput)
 * @template TKey - The type of the primary key (default: string)
 */
export abstract class BaseRepository<
  TDelegate,
  TModel extends { id: TKey },
  TCreateInput,
  TUpdateInput,
  TWhereInput,
  TOrderByInput,
  TKey extends string | number = string,
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelDelegate: TDelegate,
    protected readonly options: {
      searchableFields?: (keyof TModel & string)[];
    } = {},
  ) {}

  protected getDelegate(): TDelegate {
    return this.modelDelegate;
  }

  async create(data: TCreateInput): Promise<TModel> {
    const result = await (this.modelDelegate as any).create({ data });
    return result as TModel;
  }

  async update(id: TKey, data: TUpdateInput): Promise<TModel> {
    const result = await (this.modelDelegate as any).update({
      where: { id },
      data,
    });
    return result as TModel;
  }

  async delete(id: TKey): Promise<void> {
    await (this.modelDelegate as any).delete({
      where: { id },
    });
  }

  async findById(id: TKey): Promise<TModel | null> {
    const result = await (this.modelDelegate as any).findUnique({
      where: { id },
    });
    return result as TModel | null;
  }

  protected buildWhere(params: any): TWhereInput {
    const {
      searchTerm,
      page: _page, // eslint-disable-line @typescript-eslint/no-unused-vars
      limit: _limit, // eslint-disable-line @typescript-eslint/no-unused-vars
      sortField: _sortField, // eslint-disable-line @typescript-eslint/no-unused-vars
      sortDirection: _sortDirection, // eslint-disable-line @typescript-eslint/no-unused-vars
      cursor: _cursor, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...filters
    } = params;

    const where: any = { ...filters };

    // Auto-apply mode: insensitive for string filters
    for (const key of Object.keys(filters)) {
      const value = filters[key];
      if (typeof value === 'string') {
        where[key] = { contains: value, mode: 'insensitive' };
      } else {
        where[key] = value;
      }
    }

    if (searchTerm && this.options.searchableFields) {
      const searchWhere = applySearch(
        where,
        { term: searchTerm, fields: this.options.searchableFields },
        this.options.searchableFields,
      );
      Object.assign(where, searchWhere);
    }

    return where as TWhereInput;
  }

  async listWithOffsetPagination(params: {
    where?: TWhereInput;
    searchTerm?: string;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    [key: string]: any;
  }): Promise<{
    data: TModel[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const {
      where: explicitWhere,
      sortField,
      sortDirection,
      page = 1,
      limit,
    } = params;

    const where = explicitWhere || this.buildWhere(params);

    const take = clampLimit(limit);
    const skip = Math.max((page - 1) * take, 0);

    const sort: SortInput<string> | undefined = sortField
      ? { field: sortField, direction: sortDirection }
      : undefined;

    const fallbackSort = { id: 'asc' } as unknown as TOrderByInput;

    // Cast generic to 'any' to satisfy Record<string, unknown> constraint
    const orderBy = buildOrderBy<string, any>(sort, fallbackSort);

    const [data, total] = await this.prisma.$transaction([
      (this.modelDelegate as any).findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      (this.modelDelegate as any).count({ where }),
    ]);

    return {
      data: data as TModel[],
      pagination: {
        total,
        page,
        limit: take,
      },
    };
  }

  async listWithCursorPagination(params: {
    where?: TWhereInput;
    searchTerm?: string;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    cursor?: string;
    limit?: number;
    [key: string]: any;
  }): Promise<{ data: TModel[]; nextCursor: string | null }> {
    const {
      where: explicitWhere,
      sortField,
      sortDirection,
      cursor,
      limit,
    } = params;

    const where = explicitWhere || this.buildWhere(params);
    const take = clampLimit(limit);

    const sort: SortInput<string> | undefined = sortField
      ? { field: sortField, direction: sortDirection }
      : undefined;

    const fallbackSort = { id: 'asc' } as unknown as TOrderByInput;
    const orderBy = buildOrderBy<string, any>(sort, fallbackSort);

    const findManyArgs: any = {
      where,
      orderBy,
      take: take + 1,
    };

    if (cursor) {
      findManyArgs.cursor = { id: cursor };
      findManyArgs.skip = 1;
    }

    const data = await (this.modelDelegate as any).findMany(findManyArgs);

    let nextCursor: string | null = null;
    if (data.length > take) {
      data.pop();
      nextCursor = String(data[data.length - 1].id);
    }

    return { data: data as TModel[], nextCursor };
  }
}

export interface IPaginatedRepository<
  TModel,
  TQueryOffset = any,
  TQueryCursor = any,
> {
  listWithOffsetPagination(params: TQueryOffset): Promise<{
    data: TModel[];
    pagination: { total: number; page: number; limit: number };
  }>;
  listWithCursorPagination(params: TQueryCursor): Promise<{
    data: TModel[];
    nextCursor: string | null;
  }>;
}
