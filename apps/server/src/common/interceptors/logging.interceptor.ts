import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Extended Request interface with requestId
 */
interface RequestWithId extends Request {
  requestId?: string;
  user?: {
    id?: string;
  };
}

/**
 * Logging Interceptor
 * Logs all incoming requests and outgoing responses
 * Includes timing information and slow request detection
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request as RequestWithId).requestId || 'unknown';
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = (request as RequestWithId).user?.id || 'anonymous';

    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent} - User: ${userId}`,
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const logMessage = `[${requestId}] ${method} ${url} - ${duration}ms`;

        if (duration > this.SLOW_REQUEST_THRESHOLD) {
          this.logger.warn(`${logMessage} - SLOW REQUEST`);
        } else {
          this.logger.log(logMessage);
        }
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error(
          `[${requestId}] ${method} ${url} - ${duration}ms - ERROR: ${errorMessage}`,
          errorStack,
        );

        return throwError(() => error);
      }),
    );
  }
}
