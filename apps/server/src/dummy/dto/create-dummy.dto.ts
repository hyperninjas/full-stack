import { IsString, IsOptional, IsUUID, MinLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@/generated/client';

export class CreateDummyDto implements Prisma.DummyModelCreateInput {
  @ApiPropertyOptional({ description: 'The unique identifier of the dummy' })
  @IsUUID()
  @IsOptional()
  id?: string | undefined;

  @ApiProperty({ description: 'The name of the dummy', required: true, minLength: 3, type: 'string' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({ description: 'The description of the dummy', minLength: 15, nullable: true, type: 'string' })
  @IsString()
  @MinLength(15)
  @IsOptional()
  description?: string | null | undefined;

  @ApiPropertyOptional({ description: 'Creation timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date | undefined;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date | undefined;
}
