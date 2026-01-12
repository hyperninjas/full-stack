import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Type,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { BaseService } from './base.service';
import {
  ApiOkResponseWrapped,
  ApiPaginatedResponse,
  ApiCursorPaginatedResponse,
} from './utils/swagger.util';

export interface IBaseController<
  TModel extends { id: any },
  TCreateDto,
  TUpdateDto,
  TQueryOffsetDto,
  TQueryCursorDto,
> {
  create(dto: TCreateDto): Promise<TModel>;
  findAll(query: TQueryOffsetDto): Promise<{
    data: TModel[];
    pagination: { total: number; page: number; limit: number };
  }>;
  findAllCursor(query: TQueryCursorDto): Promise<{
    data: TModel[];
    nextCursor: string | null;
  }>;
  findOne(id: string): Promise<TModel | null>;
  update(id: string, dto: TUpdateDto): Promise<TModel>;
  delete(id: string): Promise<void>;
}

export function BaseControllerFactory<
  TModel extends { id: any },
  TCreateDto,
  TUpdateDto,
  TQueryOffsetDto,
  TQueryCursorDto,
>(
  ModelDto: Type<TModel>,
  CreateDto: Type<TCreateDto>,
  UpdateDto: Type<TUpdateDto>,
  QueryOffsetDto: Type<TQueryOffsetDto>,
  QueryCursorDto: Type<TQueryCursorDto>,
): Type<
  IBaseController<
    TModel,
    TCreateDto,
    TUpdateDto,
    TQueryOffsetDto,
    TQueryCursorDto
  >
> {
  @ApiExtraModels(
    ModelDto,
    CreateDto,
    UpdateDto,
    QueryOffsetDto,
    QueryCursorDto,
  )
  class BaseController implements IBaseController<
    TModel,
    TCreateDto,
    TUpdateDto,
    TQueryOffsetDto,
    TQueryCursorDto
  > {
    constructor(
      protected readonly service: BaseService<
        TModel,
        TCreateDto,
        TUpdateDto,
        any,
        any,
        any,
        any
      >,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new resource' })
    @ApiOkResponseWrapped(ModelDto)
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() dto: TCreateDto): Promise<TModel> {
      return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all resources (offset pagination)' })
    @ApiPaginatedResponse(ModelDto)
    async findAll(@Query() query: TQueryOffsetDto): Promise<{
      data: TModel[];
      pagination: { total: number; page: number; limit: number };
    }> {
      return this.service.listWithOffsetPagination(query);
    }

    @Get('cursor')
    @ApiOperation({ summary: 'Get all resources (cursor pagination)' })
    @ApiCursorPaginatedResponse(ModelDto)
    async findAllCursor(@Query() query: TQueryCursorDto): Promise<{
      data: TModel[];
      nextCursor: string | null;
    }> {
      return this.service.listWithCursorPagination(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get resource by id' })
    @ApiParam({ name: 'id', type: 'string', description: 'Resource ID' })
    @ApiOkResponseWrapped(ModelDto)
    @ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Resource not found',
    })
    async findOne(@Param('id') id: string): Promise<TModel | null> {
      return this.service.findById(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a resource' })
    @ApiParam({ name: 'id', type: 'string', description: 'Resource ID' })
    @ApiOkResponseWrapped(ModelDto)
    @ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Resource not found',
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
      @Param('id') id: string,
      @Body() dto: TUpdateDto,
    ): Promise<TModel> {
      return this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a resource' })
    @ApiParam({ name: 'id', type: 'string', description: 'Resource ID' })
    @ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Resource deleted successfully',
    })
    async delete(@Param('id') id: string): Promise<void> {
      return this.service.delete(id);
    }
  }

  return BaseController;
}
