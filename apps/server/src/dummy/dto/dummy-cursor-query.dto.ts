import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseCursorQueryDto } from '../../common/dto/query.dto';
import type { DummyScalarField } from './dummy-query.dto';

const SORTABLE_FIELDS: DummyScalarField[] = [
  'id',
  'name',
  'description',
  'createdAt',
  'updatedAt',
];

export class DummyCursorQueryDto extends BaseCursorQueryDto {
  @ApiPropertyOptional({ description: 'Filter by name', type: 'string' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by description', type: 'string' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: SORTABLE_FIELDS })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  declare sortField?: DummyScalarField;
}
