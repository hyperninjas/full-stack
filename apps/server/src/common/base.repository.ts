import { PrismaService } from '../prisma/prisma.service';
import { clampLimit, buildOrderBy, SortInput } from './prisma-query.util';

export interface PrismaDelegate<TModel, TWhereInput, TOrderByInput> {
  findMany(args: {
    where?: TWhereInput;
    orderBy?: TOrderByInput | TOrderByInput[];
    skip?: number;
    take?: number;
    cursor?: any;
  }): Promise<TModel[]>;
  count(args: { where?: TWhereInput }): Promise<number>;
}

export abstract class BaseRepository<
  TModel extends { id: string | number },
  TWhereInput,
  TOrderByInput extends Record<string, any>,
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelDelegate: PrismaDelegate<
      TModel,
      TWhereInput,
      TOrderByInput
    >,
  ) {}

  async listWithOffsetPagination(params: {
    where?: TWhereInput;
    sort?: SortInput<string>;
    page?: number;
    limit?: number;
    fallbackSort: TOrderByInput;
  }): Promise<{
    data: TModel[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { where, sort, page = 1, fallbackSort } = params;
    const take = clampLimit(params.limit);
    const skip = Math.max((page - 1) * take, 0);

    const orderBy = buildOrderBy<string, TOrderByInput>(sort, fallbackSort);

    // Use unknown then cast to tuple to avoid any-related lint errors with $transaction
    const result = await this.prisma.$transaction(async () => [
      await this.modelDelegate.findMany({
        where,
        orderBy: orderBy as unknown as TOrderByInput,
        skip,
        take,
      }),
      await this.modelDelegate.count({ where }),
    ]);

    const [data, total] = result as [TModel[], number];

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
    sort?: SortInput<string>;
    cursor?: string;
    limit?: number;
    fallbackSort: TOrderByInput;
  }): Promise<{ data: TModel[]; nextCursor: string | null }> {
    const { where, sort, cursor, limit, fallbackSort } = params;
    const take = clampLimit(limit);
    const orderBy = buildOrderBy<string, TOrderByInput>(sort, fallbackSort);

    const findManyArgs: {
      where?: TWhereInput;
      orderBy?: TOrderByInput;
      take: number;
      cursor?: { id: string | number };
      skip?: number;
    } = {
      where,
      orderBy: orderBy as unknown as TOrderByInput,
      take,
    };

    if (cursor) {
      findManyArgs.cursor = { id: cursor };
      findManyArgs.skip = 1;
    }

    const data = await this.modelDelegate.findMany(findManyArgs);

    const nextCursor =
      data.length === take ? String(data[data.length - 1].id) : null;

    return { data, nextCursor };
  }
}
