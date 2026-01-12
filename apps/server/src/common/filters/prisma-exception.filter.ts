import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@/generated/client';
import { Request, Response } from 'express';

/**
 * Extended Request interface with requestId
 */
interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Prisma Client Exception Filter
 * Handles Prisma-specific database errors and converts them to HTTP responses
 * This filter runs before AllExceptionsFilter to catch Prisma errors specifically
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as RequestWithId).requestId || 'unknown';

    let status: HttpStatus;
    let message: string;
    let error: string;

    switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = `The provided value for field ${this.extractTarget(exception)} is too long.`;
        error = 'Bad Request';
        break;

      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `Unique constraint failed on field ${this.extractTarget(exception)}.`;
        error = 'Conflict';
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = `Foreign key constraint failed on field ${this.extractTarget(exception)}.`;
        error = 'Bad Request';
        break;

      case 'P2011':
        status = HttpStatus.BAD_REQUEST;
        message = `Null constraint failed on field ${this.extractTarget(exception)}.`;
        error = 'Bad Request';
        break;

      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = `Relation violation on field ${this.extractTarget(exception)}.`;
        error = 'Bad Request';
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = (exception.meta?.cause as string) || 'Record not found';
        error = 'Not Found';
        break;

      default:
        // Default to base exception filter for unhandled Prisma codes
        super.catch(exception, host);
        return;
    }

    // Log Prisma errors with context
    this.logger.warn(
      `[${requestId}] Prisma error ${exception.code}: ${message} - ${request.method} ${request.url}`,
    );

    // Return standardized error response format matching AllExceptionsFilter
    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message,
        error,
        requestId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }

  /**
   * Helper to extract the target field or model from Prisma exception metadata.
   */
  private extractTarget(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const target = exception.meta?.target;
    if (Array.isArray(target)) {
      return target.join(', ');
    }
    if (typeof target === 'string') {
      return target;
    }
    const fieldName = exception.meta?.field_name;
    if (typeof fieldName === 'string') {
      return fieldName;
    }
    return 'unknown';
  }
}
