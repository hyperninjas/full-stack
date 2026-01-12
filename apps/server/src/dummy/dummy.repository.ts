/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaDelegate } from '../common/base.repository';
import { applySearch } from '../common/prisma-query.util';
import { PrismaService } from '../prisma/prisma.service';
import { DummyCursorQueryDto } from './dto/dummy-cursor-query.dto';
import { DummyOffsetQueryDto } from './dto/dummy-offset-query.dto';
import type { DummySearchField } from './dto/dummy-query.dto';
import { DummyDto } from './dto/dummy.dto';

// Type definitions for DummyModel (may not exist in generated Prisma client)
type DummyModelWhereInput = Record<string, unknown>;
type DummyModelOrderByWithRelationInput = Record<string, unknown>;
type DummyModelCreateInput = Record<string, unknown>;
type DummyModelUpdateInput = Record<string, unknown>;

@Injectable()
export class DummyRepository extends BaseRepository<
  DummyDto,
  DummyModelWhereInput,
  DummyModelOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(
      prisma,
      (prisma as any).dummyModel as unknown as PrismaDelegate<
        DummyDto,
        DummyModelWhereInput,
        DummyModelOrderByWithRelationInput
      >,
    );
  }

  async create(data: DummyModelCreateInput): Promise<DummyDto> {
    return (await (this.prisma as any).dummyModel.create({ data })) as DummyDto;
  }

  async findById(id: string): Promise<DummyDto | null> {
    return (await (this.prisma as any).dummyModel.findUnique({
      where: { id },
    })) as DummyDto | null;
  }

  private buildWhere(query: DummyOffsetQueryDto | DummyCursorQueryDto) {
    const { name, description, searchTerm } = query;
    const where: DummyModelWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      } as unknown as DummyModelWhereInput;
    }
    if (description) {
      where.description = {
        contains: description,
        mode: 'insensitive',
      } as unknown as DummyModelWhereInput;
    }

    const searchableFields: readonly DummySearchField[] = [
      'name',
      'description',
    ];
    return applySearch(
      where,
      searchTerm
        ? { term: searchTerm, fields: ['name', 'description'] }
        : undefined,
      searchableFields,
    );
  }

  async listWithOffsetPagination(params: DummyOffsetQueryDto) {
    const { sortField, sortDirection, page, limit } = params;
    return await super.listWithOffsetPagination({
      where: this.buildWhere(params),
      sort: sortField
        ? { field: sortField, direction: sortDirection }
        : undefined,
      page,
      limit,
      fallbackSort: { createdAt: 'desc' } as DummyModelOrderByWithRelationInput,
    });
  }

  async listWithCursorPagination(params: DummyCursorQueryDto) {
    const { sortField, sortDirection, cursor, limit } = params;
    return await super.listWithCursorPagination({
      where: this.buildWhere(params),
      sort: sortField
        ? { field: sortField, direction: sortDirection }
        : undefined,
      cursor,
      limit,
      fallbackSort: { createdAt: 'desc' } as DummyModelOrderByWithRelationInput,
    });
  }

  async update(id: string, data: DummyModelUpdateInput): Promise<DummyDto> {
    return (await (this.prisma as any).dummyModel.update({
      where: { id },
      data,
    })) as DummyDto;
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).dummyModel.delete({ where: { id } });
  }
}
