import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import {
  ResponseDto,
  ResponsePaginationDto,
  PaginationMeta,
} from '../response.dto';

/**
 * Interface representing the shape of a result that might already be partially formatted
 * or contain pagination information from a service/controller.
 */
interface ResultWithData<T> {
  data: T;
  message?: string;
  [key: string]: any;
}

interface ResultWithPagination<T> extends ResultWithData<T[]> {
  pagination: PaginationMeta;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseDto<T> | ResponsePaginationDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T> | ResponsePaginationDto<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const status = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((result: unknown): ResponseDto<T> | ResponsePaginationDto<T> => {
        // 1. Handle Paginated Results
        if (this.isPaginatedResult<T>(result)) {
          return {
            status,
            message: result.message || 'Success',
            data: result.data,
            pagination: result.pagination,
          };
        }

        // 2. Handle Already Formatted Results (with data property)
        if (this.isFormattedResult<T>(result)) {
          return {
            status,
            message: result.message || 'Success',
            ...result,
          } as ResponseDto<T>;
        }

        // 3. Generic wrapping for raw data
        return {
          status,
          message: 'Success',
          data: result as T,
        };
      }),
    );
  }

  /**
   * Type guard to check if the result is a paginated response.
   */
  private isPaginatedResult<T>(result: any): result is ResultWithPagination<T> {
    return (
      result !== null &&
      typeof result === 'object' &&
      'data' in result &&
      'pagination' in result
    );
  }

  /**
   * Type guard to check if the result is already formatted with a data property.
   */
  private isFormattedResult<T>(result: any): result is ResultWithData<T> {
    return (
      result !== null &&
      typeof result === 'object' &&
      'data' in result &&
      !('pagination' in result)
    );
  }
}
