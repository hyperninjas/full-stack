import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;
}

export class ResponseBase<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'HTTP status code' })
  status: number;
}

export class ResponseDto<T = unknown> extends ResponseBase<T> {}

export class ResponseArrayDto<T> extends ResponseBase<T[]> {}

export class ResponsePaginationDto<T> extends ResponseBase<T[]> {
  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}

export class ResponseCursorPaginationDto<T> extends ResponseBase<T[]> {
  @ApiProperty({ description: 'Cursor for the next page', nullable: true })
  nextCursor: string | null;
}

export class ResponseErrorDto<E = unknown> {
  @ApiProperty({ description: 'Error details', required: false })
  error?: E;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'HTTP status code' })
  status: number;
}
