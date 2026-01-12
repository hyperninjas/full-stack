import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Extended Request interface with requestId
 */
interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Transform Interceptor
 * Standardizes all API responses to a consistent format
 * Includes success flag, data, timestamp, and path
 */
export interface StandardResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  requestId?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T> | T> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request as RequestWithId).requestId;

    return next.handle().pipe(
      map((data: T) => {
        const url = request.url || '';

        // Skip transformation for:
        // - Health check endpoints (they have their own format)
        // - OpenAPI/Swagger endpoints
        // - Non-API routes (routes that don't start with /api/)
        if (
          url.includes('/health') ||
          url.includes('/swagger') ||
          !url.startsWith('/api/')
        ) {
          return data;
        }

        // Skip if data is already in standard format
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data &&
          'timestamp' in data &&
          'path' in data
        ) {
          return data as unknown as StandardResponse<T>;
        }

        // Transform to standard response format for all API endpoints
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path: request.url || '',
          ...(requestId && { requestId }),
        } as StandardResponse<T>;
      }),
    );
  }
}
