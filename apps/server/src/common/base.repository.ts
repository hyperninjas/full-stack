import { PrismaService } from '../prisma/prisma.service';
import { clampLimit, buildOrderBy, SortInput } from './prisma-query.util';

export interface PrismaDelegate<
  TModel,
  TWhereInput,
  TOrderByWithRelationInput,
> {
  findMany(args: {
    where?: TWhereInput;
    orderBy?: TOrderByWithRelationInput | TOrderByWithRelationInput[];
    skip?: number;
    take?: number;
    cursor?: any;
  }): Promise<TModel[]>;
  count(args: { where?: TWhereInput }): Promise<number>;
}

export abstract class BaseRepository<
  TModel,
  TWhereInput,
  TOrderByInput,
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelDelegate: PrismaDelegate<TModel, TWhereInput, TOrderByInput>,
  ) {}

  async listWithOffsetPagination(params: {
    where?: TWhereInput;
    sort?: SortInput<string>;
    page?: number;
    limit?: number;
    fallbackSort?: TOrderByInput;
  }) {
    const { where, sort, page = 1, fallbackSort } = params;
    const take = clampLimit(params.limit);
    const skip = Math.max((page - 1) * take, 0);

    const orderBy = buildOrderBy(sort, fallbackSort as any) as any;

    const [data, total] = await this.prisma.$transaction([
      this.modelDelegate.findMany({ where, orderBy, skip, take }),
      this.modelDelegate.count({ where }),
    ] as any);

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
    fallbackSort?: TOrderByInput;
  }) {
    const { where, sort, cursor, limit, fallbackSort } = params;
    const take = clampLimit(limit);
    const orderBy = buildOrderBy(sort, fallbackSort as any) as any;

    const data = await this.modelDelegate.findMany({
      where,
      orderBy,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor =
      data.length === take ? (data[data.length - 1] as any).id : null;

    return { data, nextCursor };
  }
}
