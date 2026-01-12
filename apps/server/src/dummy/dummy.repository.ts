import { Injectable } from '@nestjs/common';
import { Prisma, DummyModel } from '../generated/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  applySearch,
} from '../common/prisma-query.util';
import { BaseRepository } from '../common/base.repository';
import type {
  DummySearchField,
} from './dto/dummy-query.dto';
import { DummyOffsetQueryDto } from './dto/dummy-offset-query.dto';
import { DummyCursorQueryDto } from './dto/dummy-cursor-query.dto';
import { DummyDto } from './dto/dummy.dto';

@Injectable()
export class DummyRepository extends BaseRepository<
  DummyDto,
  Prisma.DummyModelWhereInput,
  Prisma.DummyModelOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.dummyModel);
  }

  async create(data: Prisma.DummyModelCreateInput): Promise<DummyDto> {
    return this.prisma.dummyModel.create({ data });
  }

  async findById(id: string): Promise<DummyDto | null> {
    return this.prisma.dummyModel.findUnique({ where: { id } });
  }

  private buildWhere(query: DummyOffsetQueryDto | DummyCursorQueryDto) {
    const { name, description, searchTerm } = query;
    const where: Prisma.DummyModelWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (description) {
      where.description = { contains: description, mode: 'insensitive' };
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
    return super.listWithOffsetPagination({
      where: this.buildWhere(params),
      sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
      page,
      limit,
      fallbackSort: { createdAt: 'desc' },
    });
  }

  async listWithCursorPagination(params: DummyCursorQueryDto) {
    const { sortField, sortDirection, cursor, limit } = params;
    return super.listWithCursorPagination({
      where: this.buildWhere(params),
      sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
      cursor,
      limit,
      fallbackSort: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: Prisma.DummyModelUpdateInput,
  ): Promise<DummyDto> {
    return this.prisma.dummyModel.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.dummyModel.delete({ where: { id } });
  }
}
