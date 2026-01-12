import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/client';
import { PrismaService } from '../prisma/prisma.service';

import { BaseRepository } from '../common/base.repository';
import { DummyDto } from './dto/dummy.dto';

@Injectable()
export class DummyRepository extends BaseRepository<
  Prisma.DummyModelDelegate,
  DummyDto,
  Prisma.DummyModelCreateInput,
  Prisma.DummyModelUpdateInput,
  Prisma.DummyModelWhereInput,
  Prisma.DummyModelOrderByWithRelationInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.dummyModel, {
      searchableFields: ['name', 'description'],
    });
  }
}
