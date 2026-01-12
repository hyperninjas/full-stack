import { Controller } from '@nestjs/common';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { DummyService } from './dummy.service';
import { CreateDummyDto } from './dto/create-dummy.dto';
import { UpdateDummyDto } from './dto/update-dummy.dto';
import { DummyDto } from './dto/dummy.dto';
import { DummyOffsetQueryDto } from './dto/dummy-offset-query.dto';
import { DummyCursorQueryDto } from './dto/dummy-cursor-query.dto';
import { ResponseDto } from '../common/response.dto';
import { BaseControllerFactory } from '../common/base.controller';

@Controller('dummy')
@ApiTags('Dummy')
@ApiExtraModels(ResponseDto)
export class DummyController extends BaseControllerFactory<
  DummyDto,
  CreateDummyDto,
  UpdateDummyDto,
  DummyOffsetQueryDto,
  DummyCursorQueryDto
>(
  DummyDto,
  CreateDummyDto,
  UpdateDummyDto,
  DummyOffsetQueryDto,
  DummyCursorQueryDto,
) {
  constructor(protected readonly dummyService: DummyService) {
    super(dummyService);
  }
}
