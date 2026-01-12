/**
 * Type declarations for Express Request extensions
 * Adds requestId property to Express Request type
 */
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
  }
}
