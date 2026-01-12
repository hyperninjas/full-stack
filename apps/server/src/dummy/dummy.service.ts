import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/client';
import { DummyRepository } from './dummy.repository';
import { DummyDto } from './dto/dummy.dto';
import { DummyOffsetQueryDto } from './dto/dummy-offset-query.dto';
import { DummyCursorQueryDto } from './dto/dummy-cursor-query.dto';

@Injectable()
export class DummyService {
  constructor(private readonly dummyRepository: DummyRepository) {}

  create(data: Prisma.DummyModelCreateInput): Promise<DummyDto> {
    return this.dummyRepository.create(data);
  }

  listWithOffsetPagination(
    params: DummyOffsetQueryDto = new DummyOffsetQueryDto(),
  ): Promise<{
    data: DummyDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    return this.dummyRepository.listWithOffsetPagination(params);
  }

  listWithCursorPagination(
    params: DummyCursorQueryDto = new DummyCursorQueryDto(),
  ): Promise<{ data: DummyDto[]; nextCursor: string | null }> {
    return this.dummyRepository.listWithCursorPagination(params);
  }

  findById(id: string): Promise<DummyDto | null> {
    return this.dummyRepository.findById(id);
  }

  update(id: string, data: Prisma.DummyModelUpdateInput): Promise<DummyDto> {
    return this.dummyRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.dummyRepository.delete(id);
  }
}
