import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/client';
import {
  clampLimit,
  buildOrderBy,
  SortInput,
  applySearch,
  GenericPrismaWhere,
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
export interface PrismaDelegate<
  TModel,
  TCreateInput,
  TUpdateInput,
  TWhereInput,
  TOrderByInput,
  TWhereUniqueInput,
> {
  create(args: { data: TCreateInput }): Prisma.PrismaPromise<TModel>;
  update(args: {
    where: TWhereUniqueInput;
    data: TUpdateInput;
  }): Prisma.PrismaPromise<TModel>;
  delete(args: { where: TWhereUniqueInput }): Prisma.PrismaPromise<TModel>;
  findUnique(args: {
    where: TWhereUniqueInput;
  }): Prisma.PrismaPromise<TModel | null>;
  findMany(args: {
    where?: TWhereInput;
    orderBy?: TOrderByInput | TOrderByInput[];
    skip?: number;
    take?: number;
    cursor?: TWhereUniqueInput;
  }): Prisma.PrismaPromise<TModel[]>;
  count(args: { where?: TWhereInput }): Prisma.PrismaPromise<number>;
}

export abstract class BaseRepository<
  TDelegate extends PrismaDelegate<
    TModel,
    TCreateInput,
    TUpdateInput,
    TWhereInput,
    TOrderByInput,
    TWhereUniqueInput
  >,
  TModel extends { id: TKey },
  TCreateInput,
  TUpdateInput,
  TWhereInput,
  TOrderByInput,
  TWhereUniqueInput,
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
    const result = await this.modelDelegate.create({ data });
    return result;
  }

  async update(id: TKey, data: TUpdateInput): Promise<TModel> {
    const result = await this.modelDelegate.update({
      where: { id } as unknown as TWhereUniqueInput,
      data,
    });
    return result;
  }

  async delete(id: TKey): Promise<void> {
    await this.modelDelegate.delete({
      where: { id } as unknown as TWhereUniqueInput,
    });
  }

  async findById(id: TKey): Promise<TModel | null> {
    const result = await this.modelDelegate.findUnique({
      where: { id } as unknown as TWhereUniqueInput,
    });
    return result;
  }

  protected buildWhere(
    params: {
      searchTerm?: string;
      page?: number;
      limit?: number;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
      cursor?: string;
    } & Record<string, unknown>,
  ): TWhereInput {
    const {
      searchTerm,
      page: _page, // eslint-disable-line @typescript-eslint/no-unused-vars
      limit: _limit, // eslint-disable-line @typescript-eslint/no-unused-vars
      sortField: _sortField, // eslint-disable-line @typescript-eslint/no-unused-vars
      sortDirection: _sortDirection, // eslint-disable-line @typescript-eslint/no-unused-vars
      cursor: _cursor, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...filters
    } = params;

    const where: Record<string, unknown> = { ...filters };

    // Iterate over filters to check for searchable fields
    for (const [key, value] of Object.entries(filters)) {
      if (
        this.options.searchableFields?.includes(key as keyof TModel & string) &&
        typeof value === 'string'
      ) {
        // Apply fuzzy match for specific searchable fields
        where[key] = { contains: value, mode: 'insensitive' };
      }
    }

    if (searchTerm && this.options.searchableFields) {
      // Cast where to GenericPrismaWhere for applySearch
      const searchWhere = applySearch(
        where as GenericPrismaWhere,
        { term: searchTerm, fields: this.options.searchableFields },
        this.options.searchableFields,
      );
      Object.assign(where, searchWhere);
    }

    return where as unknown as TWhereInput;
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

    const orderBy = buildOrderBy<string, Record<string, unknown>>(
      sort,
      fallbackSort as unknown as Record<string, unknown>,
    );

    const [data, total] = await this.prisma.$transaction([
      this.modelDelegate.findMany({
        where,
        orderBy: orderBy as unknown as TOrderByInput | TOrderByInput[],
        skip,
        take,
      }),
      this.modelDelegate.count({ where }),
    ] as [Prisma.PrismaPromise<TModel[]>, Prisma.PrismaPromise<number>]);

    return {
      data,
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
    const orderBy = buildOrderBy<string, Record<string, unknown>>(
      sort,
      fallbackSort as unknown as Record<string, unknown>,
    );

    // Explicitly type findManyArgs
    const findManyArgs: {
      where?: TWhereInput;
      orderBy?: TOrderByInput | TOrderByInput[];
      take?: number;
      skip?: number;
      cursor?: TWhereUniqueInput;
    } = {
      where,
      orderBy: orderBy as unknown as TOrderByInput | TOrderByInput[],
      take: take + 1,
    };

    if (cursor) {
      findManyArgs.cursor = { id: cursor } as unknown as TWhereUniqueInput;
      findManyArgs.skip = 1;
    }

    const data = await this.modelDelegate.findMany(findManyArgs);

    let nextCursor: string | null = null;
    if (data.length > take) {
      data.pop();
      nextCursor = String(data[data.length - 1].id);
    }

    return { data, nextCursor };
  }
}

export interface IPaginatedRepository<
  TModel,
  TQueryOffset = unknown,
  TQueryCursor = unknown,
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
