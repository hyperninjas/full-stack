import { ApiProperty } from '@nestjs/swagger';
import { DummyModel } from '@/generated/prisma/client';

export class DummyDto implements DummyModel {
  @ApiProperty({ description: 'The unique identifier' })
  id: string;

  @ApiProperty({ description: 'The name' })
  name: string;

  @ApiProperty({
    description: 'The description',
    nullable: true,
    type: 'string',
  })
  description: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
