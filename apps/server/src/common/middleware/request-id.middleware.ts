import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

/**
 * Request ID Middleware
 * Generates and propagates a unique request ID for each incoming request
 * This ID is used for tracing requests across the application
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Get request ID from header or generate a new one
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    // Attach request ID to request object
    (req as Request & { requestId?: string }).requestId = requestId;

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Log request ID in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `Request ID: ${requestId} for ${req.method} ${req.url}`,
      );
    }

    next();
  }
}
