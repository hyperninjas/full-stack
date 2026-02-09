import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { BaseService } from '../common/base.service';
import { DummyRepository } from './dummy.repository';
import { DummyDto } from './dto/dummy.dto';
import { CreateDummyDto } from './dto/create-dummy.dto';
import { UpdateDummyDto } from './dto/update-dummy.dto';
import { DummyOffsetQueryDto } from './dto/dummy-offset-query.dto';
import { DummyCursorQueryDto } from './dto/dummy-cursor-query.dto';

@Injectable()
export class DummyService extends BaseService<
  DummyDto,
  CreateDummyDto,
  UpdateDummyDto,
  DummyOffsetQueryDto,
  DummyCursorQueryDto,
  Prisma.DummyModelWhereUniqueInput,
  DummyRepository,
  string
> {
  constructor(private readonly dummyRepository: DummyRepository) {
    super(dummyRepository);
  }
}
