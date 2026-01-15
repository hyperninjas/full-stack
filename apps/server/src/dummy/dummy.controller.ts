import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiOperation } from '@nestjs/swagger';
import { DummyService } from './dummy.service';
import { CreateDummyDto } from './dto/create-dummy.dto';
import { UpdateDummyDto } from './dto/update-dummy.dto';
import { DummyDto } from './dto/dummy.dto';
import { DummyOffsetQueryDto } from './dto/dummy-offset-query.dto';
import { DummyCursorQueryDto } from './dto/dummy-cursor-query.dto';
import { ResponseDto } from '../common/response.dto';
import { BaseControllerFactory } from '../common/base.controller';
import {
  ApiPaginatedResponse,
  ApiCursorPaginatedResponse,
} from '../common/utils/swagger.util';

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

  @Get()
  @ApiOperation({ summary: 'Get all dummies (offset pagination)' })
  @ApiPaginatedResponse(DummyDto)
  async findAll(@Query() query: DummyOffsetQueryDto) {
    return super.findAll(query);
  }

  @Get('cursor')
  @ApiOperation({ summary: 'Get all dummies (cursor pagination)' })
  @ApiCursorPaginatedResponse(DummyDto)
  async findAllCursor(@Query() query: DummyCursorQueryDto) {
    return super.findAllCursor(query);
  }
}
