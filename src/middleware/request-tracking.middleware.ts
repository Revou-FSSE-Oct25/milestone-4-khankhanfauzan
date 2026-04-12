import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request Tracking Middleware
 * Generates a unique Request ID for each incoming request.
 * Useful for debugging and log correlation.
 */
@Injectable()
export class RequestTrackingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Attach to request object for use in controllers/services
    req['requestId'] = requestId;

    // Add to response header
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
