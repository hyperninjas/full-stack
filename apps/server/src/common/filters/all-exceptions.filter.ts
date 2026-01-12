import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Extended Request interface with requestId
 */
interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Global Exception Filter
 * Catches all exceptions and returns a standardized error response
 * Includes request ID, error details, and proper logging
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as RequestWithId).requestId || 'unknown';

    // Determine status code and message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | object = 'Internal Server Error';
    let details: string | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        error = (responseObj.error as string) || exception.message;
        details = (responseObj.details as string) || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      details =
        process.env.NODE_ENV === 'development' ? exception.stack || null : null;
    }

    // Build error response
    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        error,
        ...(details && { details }),
        requestId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    // Log error with context
    const logContext = {
      requestId,
      statusCode: status,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.get('user-agent') || undefined,
      userId:
        (request as Request & { user?: { id?: string } }).user?.id ||
        'anonymous',
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${status} ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
        logContext,
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - ${status} ${message}`,
        logContext,
      );
    }

    // Send error response
    response.status(status).json(errorResponse);
  }
}
