import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto, ResponsePaginationDto } from '../response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T> | ResponsePaginationDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T> | ResponsePaginationDto<T>> {
    const response = context.switchToHttp().getResponse();
    const status = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((result) => {
        // If the result already matches the response structure (e.g. from service)
        if (result && result.data && result.pagination) {
          return {
            status,
            message: 'Success',
            data: result.data,
            pagination: result.pagination,
          };
        }

        if (result && result.data) {
          return {
            status,
            message: 'Success',
            ...result,
          };
        }

        // Generic wrapping for raw data
        return {
          status,
          message: 'Success',
          data: result,
        };
      }),
    );
  }
}
