import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiOperation,
  ApiExtraModels,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';
import { DummyService } from './dummy.service';
import { CreateDummyDto } from './dto/create-dummy.dto';
import { UpdateDummyDto } from './dto/update-dummy.dto';
import { DummyDto } from './dto/dummy.dto';
import { DummyOffsetQueryDto } from './dto/dummy-offset-query.dto';
import { DummyCursorQueryDto } from './dto/dummy-cursor-query.dto';
import {
  ResponseDto,
} from '../common/response.dto';
import {
  ApiOkResponseWrapped,
  ApiPaginatedResponse,
  ApiCursorPaginatedResponse,
} from '../common/utils/swagger.util';

@Controller('dummy')
@ApiTags('Dummy')
@ApiExtraModels(DummyDto)
@ApiExtraModels(DummyOffsetQueryDto)
@ApiExtraModels(DummyCursorQueryDto)
@ApiExtraModels(CreateDummyDto)
@ApiExtraModels(UpdateDummyDto)
@ApiExtraModels(ResponseDto)
export class DummyController {
  constructor(private readonly dummyService: DummyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dummy' })
  @ApiOkResponseWrapped(DummyDto)
  create(@Body() dto: CreateDummyDto): Promise<DummyDto> {
    return this.dummyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dummies (offset pagination)' })
  @ApiPaginatedResponse(DummyDto)
  findAll(@Query() query: DummyOffsetQueryDto): Promise<{
    data: DummyDto[];
    pagination: { total: number; page: number; limit: number };
  }> {
    return this.dummyService.listWithOffsetPagination(query);
  }

  @Get('cursor')
  @ApiOperation({ summary: 'Get all dummies (cursor pagination)' })
  @ApiCursorPaginatedResponse(DummyDto)
  findAllCursor(
    @Query() query: DummyCursorQueryDto,
  ): Promise<{ data: DummyDto[]; nextCursor: string | null }> {
    return this.dummyService.listWithCursorPagination(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dummy by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Dummy ID' })
  @ApiOkResponseWrapped(DummyDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Dummy not found',
  })
  findOne(@Param('id') id: string): Promise<DummyDto | null> {
    return this.dummyService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a dummy' })
  @ApiParam({ name: 'id', type: 'string', description: 'Dummy ID' })
  @ApiOkResponseWrapped(DummyDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Dummy not found',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDummyDto,
  ): Promise<DummyDto> {
    return this.dummyService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a dummy' })
  @ApiParam({ name: 'id', type: 'string', description: 'Dummy ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Dummy deleted successfully',
  })
  delete(@Param('id') id: string): Promise<void> {
    return this.dummyService.delete(id);
  }
}
