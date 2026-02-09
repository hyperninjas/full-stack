import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@/generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

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

    response.status(status).json({
      status,
      message,
      error,
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
