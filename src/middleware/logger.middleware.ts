import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Functional Middleware
 * Simple, lightweight, and suitable for logic that doesn't
 * require dependency injection.
 */
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`[Function Logger] ${req.method} ${req.originalUrl}`);
  next();
}

/**
 * Class-based Middleware
 * Powerful, supports Dependency Injection, and can be used
 * with the standard Injectable pattern.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    console.log(`[Class Logger] ${method} ${originalUrl} - ${userAgent}`);

    next();
  }
}
